'use client';

import { useEffect, useState } from 'react';
import { useBackend } from './provider';
import type { RealtimeChange } from '@veralogix/secureconnect-sdk';

export type UseCollectionResult<T> = {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

/**
 * Fetch a collection and optionally subscribe to realtime updates.
 */
export function useCollection<T extends { id: string }>(
  resource: string,
  opts?: { siteId?: string; realtimeTable?: string; enabled?: boolean },
): UseCollectionResult<T> {
  const { client, user } = useBackend();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const enabled = opts?.enabled !== false;

  const refresh = async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const siteId = opts?.siteId ?? user?.siteIds[0];
      const res = await client.list<T>(resource, { siteId, limit: 100 });
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, opts?.siteId, user?.id, enabled]);

  useEffect(() => {
    const siteId = opts?.siteId ?? user?.siteIds[0];
    const table = opts?.realtimeTable;
    if (!enabled || !siteId || !table || !user) return;

    const unsub = client.subscribe({ siteId, tables: [table] }, (change: RealtimeChange) => {
      if (change.table !== table) return;
      void refresh();
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts?.realtimeTable, opts?.siteId, user?.id, enabled]);

  return { data, isLoading, error, refresh };
}

export function useDoc<T extends { id: string }>(
  resource: string,
  id: string | null | undefined,
): { data: T | null; isLoading: boolean; error: Error | null } {
  const { client } = useBackend();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    client
      .get<T>(resource, id)
      .then((row) => {
        setData(row);
        setError(null);
      })
      .catch((err) => {
        setError(err as Error);
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [client, resource, id]);

  return { data, isLoading, error };
}
