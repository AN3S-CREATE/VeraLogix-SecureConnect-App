'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createClient,
  SecureConnectClient,
  type SessionUser,
  type Role,
} from '@veralogix/secureconnect-sdk';

/** Legacy keys — cleared on boot so tokens are no longer persisted in localStorage. */
const LEGACY_TOKEN_KEY = 'sc_access_token';
const LEGACY_REFRESH_KEY = 'sc_refresh_token';
const LEGACY_USER_KEY = 'sc_user';

type BackendContextValue = {
  client: SecureConnectClient;
  user: SessionUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  loginDev: () => Promise<SessionUser>;
  logout: () => Promise<void>;
  roles: Role[];
};

const BackendContext = createContext<BackendContextValue | null>(null);

function clearLegacyStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function BackendClientProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const setUserRef = useRef(setUser);
  setUserRef.current = setUser;

  const client = useMemo(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? apiUrl.replace(/^http/, 'ws');
    return createClient({
      apiUrl,
      wsUrl,
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        tokenRef.current = null;
        setUserRef.current(null);
        void fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
      },
    });
  }, []);

  useEffect(() => {
    clearLegacyStorage();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'same-origin' });
        if (!res.ok) {
          if (!cancelled) {
            setUser(null);
            tokenRef.current = null;
          }
          return;
        }
        const body = (await res.json()) as {
          authenticated: boolean;
          user: SessionUser | null;
          accessToken: string | null;
        };
        if (cancelled) return;
        if (body.authenticated && body.accessToken && body.user) {
          tokenRef.current = body.accessToken;
          client.setTokens(body.accessToken);
          setUser(body.user);
        } else {
          setUser(null);
          tokenRef.current = null;
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          tokenRef.current = null;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const applySession = useCallback(
    (accessToken: string, refreshToken: string | undefined, nextUser: SessionUser) => {
      tokenRef.current = accessToken;
      client.setTokens(accessToken, refreshToken);
      setUser(nextUser);
    },
    [client],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json()) as {
        user?: SessionUser;
        accessToken?: string;
        refreshToken?: string;
        error?: { message?: string };
      };
      if (!res.ok || !body.user || !body.accessToken) {
        throw new Error(body.error?.message ?? 'Login failed');
      }
      applySession(body.accessToken, body.refreshToken, body.user);
      return body.user;
    },
    [applySession],
  );

  const loginDev = useCallback(async () => {
    const res = await fetch('/api/auth/dev-session', {
      method: 'POST',
      credentials: 'same-origin',
    });
    const body = (await res.json()) as {
      user?: SessionUser;
      accessToken?: string;
      refreshToken?: string;
      error?: { message?: string };
    };
    if (!res.ok || !body.user || !body.accessToken) {
      throw new Error(body.error?.message ?? 'Dev session unavailable');
    }
    applySession(body.accessToken, body.refreshToken, body.user);
    return body.user;
  }, [applySession]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(
      () => undefined,
    );
    client.clearTokens();
    tokenRef.current = null;
    setUser(null);
  }, [client]);

  const value: BackendContextValue = {
    client,
    user,
    isLoading,
    login,
    loginDev,
    logout,
    roles: user?.roles ?? [],
  };

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error('useBackend must be used within BackendClientProvider');
  return ctx;
}

export function useUser() {
  const { user, isLoading } = useBackend();
  return { user, isLoading };
}

export function useAuthClient() {
  return useBackend().client;
}
