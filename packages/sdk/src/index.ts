export type Role =
  | 'resident'
  | 'agent'
  | 'trustee'
  | 'vendor'
  | 'estate_manager'
  | 'admin';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  siteIds: string[];
};

export type Session = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  user: SessionUser;
};

export type Paginated<T> = {
  data: T[];
  meta: { nextCursor: string | null; limit: number };
};

export type RealtimeChange = {
  op: string;
  table: string;
  id: string;
  siteId: string;
  row?: unknown;
};

export type SecureConnectClientOptions = {
  apiUrl: string;
  wsUrl?: string;
  getToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
};

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class SecureConnectClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(private readonly opts: SecureConnectClientOptions) {}

  setTokens(accessToken: string, refreshToken?: string) {
    this.token = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
  }

  getAccessToken() {
    return this.opts.getToken?.() ?? this.token;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      if (token === 'dev-bypass') headers.set('x-dev-bypass', '1');
    }

    const res = await fetch(`${this.opts.apiUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers,
    });

    if (res.status === 401) {
      this.opts.onUnauthorized?.();
    }

    const text = await res.text();
    const body = text ? (JSON.parse(text) as unknown) : null;
    if (!res.ok) {
      const err = body as { error?: { code?: string; message?: string; details?: unknown } } | null;
      throw new ApiError(
        err?.error?.code ?? 'HTTP_ERROR',
        err?.error?.message ?? res.statusText,
        res.status,
        err?.error?.details,
      );
    }
    return body as T;
  }

  async login(email: string, password: string): Promise<Session> {
    const session = await this.request<Session>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(session.accessToken, session.refreshToken);
    return session;
  }

  async register(input: {
    email: string;
    password: string;
    name: string;
    consentPurpose?: string;
    consentVersion?: string;
  }): Promise<Session> {
    const session = await this.request<Session>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (session.accessToken) this.setTokens(session.accessToken, session.refreshToken);
    return session;
  }

  async requestPasswordReset(email: string) {
    return this.request<{ ok: boolean; message: string }>('/api/v1/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async devSession(): Promise<Session> {
    const session = await this.request<Session>('/api/v1/auth/dev-session', { method: 'POST' });
    this.setTokens(session.accessToken, session.refreshToken);
    return session;
  }

  async refresh(): Promise<{ accessToken: string; refreshToken?: string }> {
    if (!this.refreshToken) throw new ApiError('NO_REFRESH', 'No refresh token', 401);
    const tokens = await this.request<{ accessToken: string; refreshToken?: string }>(
      '/api/v1/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken: this.refreshToken }) },
    );
    this.setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  }

  async logout(): Promise<void> {
    await this.request('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken ?? undefined }),
    }).catch(() => undefined);
    this.clearTokens();
  }

  me() {
    return this.request<SessionUser & { memberships: { siteId: string; role: Role }[] }>(
      '/api/v1/auth/me',
    );
  }

  list<T>(resource: string, query?: Record<string, string | number | undefined>) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    const suffix = qs.toString() ? `?${qs}` : '';
    return this.request<Paginated<T>>(`/api/v1/${resource}${suffix}`);
  }

  get<T>(resource: string, id: string) {
    return this.request<T>(`/api/v1/${resource}/${id}`);
  }

  create<T>(resource: string, body: unknown) {
    return this.request<T>(`/api/v1/${resource}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  update<T>(resource: string, id: string, body: unknown) {
    return this.request<T>(`/api/v1/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  remove(resource: string, id: string) {
    return this.request<{ ok: boolean }>(`/api/v1/${resource}/${id}`, { method: 'DELETE' });
  }

  unlockDoor(id: string, result: 'granted' | 'denied' = 'granted') {
    return this.request<{ door: unknown; accessLog: unknown }>(`/api/v1/doors/${id}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ result }),
    });
  }

  async presignUpload(input: {
    siteId: string;
    filename: string;
    mime: string;
    sizeBytes: number;
  }) {
    return this.request<{
      file: { id: string; objectKey: string };
      uploadUrl: string;
      expiresIn: number;
    }>('/api/v1/files/presign-upload', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async uploadFile(input: {
    siteId: string;
    file: Blob;
    filename: string;
    mime: string;
  }) {
    const { file, uploadUrl } = await this.presignUpload({
      siteId: input.siteId,
      filename: input.filename,
      mime: input.mime,
      sizeBytes: input.file.size,
    });
    const put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': input.mime },
      body: input.file,
    });
    if (!put.ok) throw new ApiError('UPLOAD_FAILED', 'Failed to upload to storage', put.status);
    return file;
  }

  /**
   * Subscribe to realtime Postgres changes via WebSocket.
   * @example
   * const unsub = client.subscribe({ siteId, tables: ['doors', 'access_logs'] }, (change) => console.log(change));
   */
  subscribe(
    opts: { siteId: string; tables?: string[] },
    onChange: (change: RealtimeChange) => void,
    onEvent?: (event: { type: string; [k: string]: unknown }) => void,
  ): () => void {
    const wsUrl = (this.opts.wsUrl ?? this.opts.apiUrl.replace(/^http/, 'ws')).replace(/\/$/, '');
    const ws = new WebSocket(`${wsUrl}/ws`);
    let closed = false;

    ws.onopen = () => {
      const token = this.getAccessToken();
      ws.send(JSON.stringify({ type: 'auth', token, siteId: opts.siteId }));
    };

    ws.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data)) as {
        type: string;
        data?: RealtimeChange;
        [k: string]: unknown;
      };
      onEvent?.(msg);
      if (msg.type === 'authenticated') {
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            siteId: opts.siteId,
            tables: opts.tables,
          }),
        );
      }
      if (msg.type === 'change' && msg.data) onChange(msg.data);
    };

    return () => {
      if (closed) return;
      closed = true;
      ws.close();
    };
  }
}

export function createClient(opts: SecureConnectClientOptions) {
  return new SecureConnectClient(opts);
}
