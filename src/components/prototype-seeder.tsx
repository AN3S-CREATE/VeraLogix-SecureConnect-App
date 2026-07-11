'use client';

import { useEffect } from 'react';
import { useBackend } from '@/backend';

/**
 * Ensures demo site data exists by calling the API seed-friendly endpoints when empty.
 * Prefer `npm run db:seed` in backend; this is a lightweight client fallback.
 */
export function PrototypeSeeder() {
  const { client, user } = useBackend();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const doors = await client.list('doors', { siteId: user.siteIds[0], limit: 5 });
        if (cancelled || doors.data.length > 0 || !user.siteIds[0]) return;
        // If empty and user is admin/agent, create a couple of doors
        if (user.roles.some((r) => ['admin', 'agent', 'estate_manager'].includes(r))) {
          await client.create('doors', {
            siteId: user.siteIds[0],
            name: 'Main Lobby Entrance',
            state: 'locked',
            proximityReady: true,
            health: 'healthy',
          });
        }
      } catch {
        /* API may be offline during UI-only work */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, user]);

  return null;
}
