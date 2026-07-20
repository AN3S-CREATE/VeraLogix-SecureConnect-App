'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createClient,
  SecureConnectClient,
  type SessionUser,
  type Role,
} from '@veralogix/secureconnect-sdk';

const TOKEN_KEY = 'sc_access_token';
const REFRESH_KEY = 'sc_refresh_token';
const USER_KEY = 'sc_user';

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

function readStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function BackendClientProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const client = useMemo(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? apiUrl.replace(/^http/, 'ws');
    return createClient({
      apiUrl,
      wsUrl,
      getToken: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
      onUnauthorized: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const stored = readStoredUser();
    if (token) {
      client.setTokens(token, localStorage.getItem(REFRESH_KEY) ?? undefined);
      setUser(stored);
      client
        .me()
        .then((me) => {
          const next = {
            id: me.id,
            email: me.email,
            name: me.name,
            roles: me.roles,
            siteIds: me.siteIds,
          };
          localStorage.setItem(USER_KEY, JSON.stringify(next));
          setUser(next);
        })
        .catch(() => {
          /* keep stored user for offline UX */
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [client]);

  const persistSession = useCallback(
    (accessToken: string, refreshToken: string | undefined, nextUser: SessionUser) => {
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      client.setTokens(accessToken, refreshToken);
      setUser(nextUser);
      document.cookie = `sc_role=${nextUser.roles[0] ?? 'resident'}; path=/; SameSite=Lax`;
    },
    [client],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await client.login(email, password);
      persistSession(session.accessToken, session.refreshToken, session.user);
      return session.user;
    },
    [client, persistSession],
  );

  const loginDev = useCallback(async () => {
    const session = await client.devSession();
    persistSession(session.accessToken, session.refreshToken, session.user);
    return session.user;
  }, [client, persistSession]);

  const logout = useCallback(async () => {
    await client.logout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'sc_role=; path=/; Max-Age=0';
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
