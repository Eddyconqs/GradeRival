import axios, { InternalAxiosRequestConfig } from 'axios';

const STORAGE_KEY = 'graderival-auth';

interface PersistedAuthState {
  state?: {
    accessToken?: string | null;
    refreshToken?: string | null;
  };
}

const getPersistedAuth = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    return null;
  }
};

const buildAuthHeader = (token: string) => ['Bearer', token].join(' ');

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use((config) => {
  const auth = getPersistedAuth();
  const token = auth?.state?.accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = buildAuthHeader(token);
  }

  return config;
});

let refreshingPromise: Promise<string | null> | null = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const auth = getPersistedAuth();
    const refreshToken = auth?.state?.refreshToken;

    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (!refreshingPromise) {
      refreshingPromise = axios
        .post(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/auth/refresh`, { refreshToken })
        .then((response) => {
          const nextToken = response.data.accessToken as string;
          const persisted = getPersistedAuth();
          if (persisted?.state) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                ...persisted,
                state: {
                  ...persisted.state,
                  accessToken: nextToken,
                  refreshToken: response.data.refreshToken as string
                }
              })
            );
            window.dispatchEvent(
              new CustomEvent('graderival:tokens-updated', {
                detail: {
                  accessToken: nextToken,
                  refreshToken: response.data.refreshToken as string
                }
              })
            );
          }
          return nextToken;
        })
        .catch(() => null)
        .finally(() => {
          refreshingPromise = null;
        });
    }

    originalRequest._retry = true;
    const nextToken = await refreshingPromise;
    if (!nextToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = buildAuthHeader(nextToken);
    return client(originalRequest);
  }
);

export default client;
