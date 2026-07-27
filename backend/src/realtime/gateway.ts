import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { Redis } from 'ioredis';
import type { Env } from '../config/env.js';
import { createLogger } from '../config/logger.js';
import {
  recordRealtimeFanout,
  recordWsMessage,
  setWsClients,
} from '../observability/metrics.js';

export type RealtimeChange = {
  op: string;
  table: string;
  id: string;
  siteId: string;
  row?: unknown;
};

export type RealtimeOpts = {
  env: Env;
  pool: pg.Pool;
};

type ClientMeta = {
  siteIds: Set<string>;
  tables: Set<string>;
  userId?: string;
};

const REDIS_CHANNEL = 'secureconnect:realtime';

const realtimePlugin: FastifyPluginAsync<RealtimeOpts> = async (app, opts) => {
  const log = createLogger(opts.env);
  const clients = new Map<object, ClientMeta>();

  const publisher = new Redis(opts.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });
  const subscriber = new Redis(opts.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  const fanoutLocal = (change: RealtimeChange) => {
    const channel = `site:${change.siteId}:${change.table}`;
    let delivered = 0;
    for (const [socket, meta] of clients.entries()) {
      if (!meta.siteIds.has(change.siteId)) continue;
      if (meta.tables.size && !meta.tables.has(change.table)) continue;
      try {
        (socket as { send: (data: string) => void }).send(
          JSON.stringify({ type: 'change', channel, data: change }),
        );
        delivered += 1;
      } catch {
        clients.delete(socket);
      }
    }
    if (delivered) recordRealtimeFanout(delivered);
    setWsClients(clients.size);
  };

  try {
    await publisher.connect();
    await subscriber.connect();
    await subscriber.subscribe(REDIS_CHANNEL);
    subscriber.on('message', (channel, payload) => {
      if (channel !== REDIS_CHANNEL || !payload) return;
      let change: RealtimeChange;
      try {
        change = JSON.parse(payload) as RealtimeChange;
      } catch {
        return;
      }
      fanoutLocal(change);
    });
    log.info({ channel: REDIS_CHANNEL }, 'Realtime Redis fanout subscribed');
  } catch (err) {
    log.warn({ err }, 'Realtime Redis fanout unavailable — falling back to local-only');
  }

  // Dedicated LISTEN connection — publish to Redis so multi-instance APIs share events
  const listener = await opts.pool.connect();
  await listener.query('LISTEN secureconnect_changes');
  listener.on('notification', (msg) => {
    if (msg.channel !== 'secureconnect_changes' || !msg.payload) return;
    let change: RealtimeChange;
    try {
      change = JSON.parse(msg.payload) as RealtimeChange;
    } catch {
      return;
    }
    void publisher
      .publish(REDIS_CHANNEL, msg.payload)
      .catch((err) => {
        log.warn({ err }, 'Redis publish failed; delivering locally');
        fanoutLocal(change);
      });
  });

  app.addHook('onClose', async () => {
    try {
      await listener.query('UNLISTEN secureconnect_changes');
      listener.release();
    } catch {
      /* ignore */
    }
    try {
      await subscriber.unsubscribe(REDIS_CHANNEL);
      await subscriber.quit();
      await publisher.quit();
    } catch {
      /* ignore */
    }
  });

  app.get('/ws', { websocket: true }, (socket, req) => {
    const meta: ClientMeta = { siteIds: new Set(), tables: new Set() };
    clients.set(socket, meta);
    setWsClients(clients.size);

    socket.send(JSON.stringify({ type: 'hello', correlationId: req.correlationId }));

    socket.on('message', async (raw) => {
      recordWsMessage();
      try {
        const msg = JSON.parse(String(raw)) as {
          type: string;
          token?: string;
          siteId?: string;
          tables?: string[];
        };

        if (msg.type === 'auth' && msg.token) {
          req.headers.authorization = `Bearer ${msg.token}`;
          if (msg.token === 'dev-bypass' && opts.env.DEV_AUTH_BYPASS) {
            req.headers['x-dev-bypass'] = '1';
          }
          await app.authenticate(req);
          meta.userId = req.authUser!.id;
          for (const sid of req.authUser!.siteIds) meta.siteIds.add(sid);
          if (req.authUser!.roles.includes('admin') && msg.siteId) {
            meta.siteIds.add(msg.siteId);
          }
          socket.send(JSON.stringify({ type: 'authenticated', userId: meta.userId }));
          return;
        }

        if (msg.type === 'subscribe') {
          if (!meta.userId) {
            socket.send(JSON.stringify({ type: 'error', message: 'Authenticate first' }));
            return;
          }
          if (msg.siteId) {
            if (!req.authUser!.roles.includes('admin') && !req.authUser!.siteIds.includes(msg.siteId)) {
              socket.send(JSON.stringify({ type: 'error', message: 'Forbidden site' }));
              return;
            }
            meta.siteIds.add(msg.siteId);
          }
          for (const t of msg.tables ?? []) meta.tables.add(t);
          socket.send(
            JSON.stringify({
              type: 'subscribed',
              siteIds: [...meta.siteIds],
              tables: [...meta.tables],
            }),
          );
        }
      } catch (err) {
        log.warn({ err }, 'WS message error');
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
      setWsClients(clients.size);
    });
  });
};

export default realtimePlugin;
