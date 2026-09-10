'use client';

import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { registerWithFirebaseEmail, signInWithFirebaseEmail, signOutFirebase } from '@/lib/firebase';

const API_BASE = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

async function parseApiJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const preview = text.replace(/\s+/g, ' ').slice(0, 120);
    throw new Error(
      `Server returned ${response.status} ${response.statusText} instead of JSON.${preview ? ` Response: ${preview}` : ''}`
    );
  }
  return response.json();
}

export function useApi() {
  const { token, logout } = useAuthStore();
  const router = useRouter();

  const fetchApi = useCallback(
    async <T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> => {
      const { requireAuth = true, ...fetchOpts } = options;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (requireAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOpts,
        headers,
      });

      if (response.status === 401) {
        logout();
        router.push('/login');
        throw new Error('Unauthorized');
      }

      const data = await parseApiJson(response);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'An error occurred');
      }

      return data as ApiResponse<T>;
    },
    [token, logout, router]
  );

  const get = useCallback(
    <T = unknown>(endpoint: string, options?: FetchOptions) =>
      fetchApi<T>(endpoint, { ...options, method: 'GET' }),
    [fetchApi]
  );

  const post = useCallback(
    <T = unknown>(endpoint: string, body: unknown, options?: FetchOptions) =>
      fetchApi<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    [fetchApi]
  );

  const patch = useCallback(
    <T = unknown>(endpoint: string, body: unknown, options?: FetchOptions) =>
      fetchApi<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    [fetchApi]
  );

  const del = useCallback(
    <T = unknown>(endpoint: string, options?: FetchOptions) =>
      fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
    [fetchApi]
  );

  return { fetchApi, get, post, patch, del };
}

export function useAuth() {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout, updateUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (email: string, password: string, options?: { adminOnly?: boolean }) => {
    try {
      if (options?.adminOnly) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await parseApiJson(res);
        if (!res.ok) throw new Error(data.message || data.error || 'Administrator sign in failed');

        if (data?.data?.user?.role !== 'ADMIN') {
          await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
          throw new Error('This account does not have administrator access.');
        }

        storeLogin(data.data.user, data.data.token);
        return data.data;
      }

      const credential = await signInWithFirebaseEmail(email, password);
      const idToken = await credential.user.getIdToken(true);
      const res = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, adminOnly: false }),
      });
      const data = await parseApiJson(res);
      if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
      storeLogin(data.data.user, data.data.token);
      return data.data;
    } catch (error) {
      await signOutFirebase().catch(() => undefined);
      throw error;
    }
  };

  const handleRegister = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => {
    const credential = await registerWithFirebaseEmail(formData);
    const idToken = await credential.user.getIdToken(true);
    const res = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await parseApiJson(res);
    if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');
    storeLogin(data.data.user, data.data.token);
    return data.data;
  };

  const handleLogout = async () => {
    try {
      await Promise.allSettled([
        fetch('/api/auth/logout', { method: 'POST' }),
        signOutFirebase(),
      ]);
    } catch (e) {
      // Ignore logout errors
    }
    storeLogout();
    router.push('/');
  };

  const fetchProfile = async () => {
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await parseApiJson(res);
      if (res.ok && data.data) {
        updateUser(data.data);
        return data.data;
      }
    } catch (e) {
      // Ignore profile fetch errors
    }
    return null;
  };

  return {
    user,
    token,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    fetchProfile,
  };
}

export function usePaginatedData<T>(endpoint: string) {
  const { get } = useApi();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const fetch = useCallback(
    async (params?: Record<string, string | number>) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            queryParams.set(key, String(value));
          });
        }
        const url = params ? `${endpoint}?${queryParams}` : endpoint;
        const response = await get<T[]>(url);
        setData(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, get]
  );

  const nextPage = useCallback(() => {
    if (pagination.hasMore) {
      fetch({ page: pagination.page + 1, limit: pagination.limit });
    }
  }, [fetch, pagination]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      fetch({ page: pagination.page - 1, limit: pagination.limit });
    }
  }, [fetch, pagination]);

  return { data, loading, error, pagination, fetch, nextPage, prevPage };
}
