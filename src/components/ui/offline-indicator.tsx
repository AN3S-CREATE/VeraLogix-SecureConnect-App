
"use client";

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('sc.agent.offline.exited');
    };
    const handleOffline = () => {
      setIsOffline(true);
      console.log('sc.agent.offline.entered');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator.onLine === 'boolean') {
      setIsOffline(!navigator.onLine);
      if (!navigator.onLine) {
        console.log('sc.agent.offline.entered');
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="vx-offline-strip">
      <p>You are currently offline. Some functionality may be limited.</p>
    </div>
  );
}

    

    