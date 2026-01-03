/// <reference types="vite/client" />
import type { UserResponse } from '@repo/shared-types';

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5001/api';

interface RequestOptions extends RequestInit {
  credentials?: RequestCredentials;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Important for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      fetchAPI<{ user: { id: string; email: string; role: string } }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      ),

    signup: (email: string, password: string) =>
      fetchAPI<{ user: { id: string; email: string; role: string } }>(
        '/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      ),

    logout: () =>
      fetchAPI<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),

    me: () =>
      fetchAPI<{ user: { id: string; email: string; role: string } }>(
        '/auth/me',
      ),
  },

  // Documents endpoints
  documents: {
    list: (query?: { page?: number; limit?: number; status?: string }) => {
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.status) params.append('status', query.status);
      return fetchAPI(`/documents?${params.toString()}`);
    },

    get: (id: string) => fetchAPI(`/documents/${id}`),

    create: (title: string, file: File) => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      return fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || `HTTP error! status: ${res.status}`);
          });
        }
        return res.json();
      });
    },

    update: (id: string, data: { title?: string; status?: string }) =>
      fetchAPI(`/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/documents/${id}`, {
        method: 'DELETE',
      }),
  },

  // Chat endpoints
  chat: {
    sessions: {
      list: () => fetchAPI('/chat/sessions'),
      get: (id: string) => fetchAPI(`/chat/sessions/${id}`),
      create: (title?: string) =>
        fetchAPI('/chat/sessions', {
          method: 'POST',
          body: JSON.stringify({ title }),
        }),
    },

    sendMessage: (sessionId: string, content: string) =>
      fetchAPI('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ sessionId, content }),
      }),
  },

  // Dashboard endpoints
  dashboard: {
    stats: () => fetchAPI('/dashboard/stats'),
    activity: (limit?: number) =>
      fetchAPI(`/dashboard/activity${limit ? `?limit=${limit}` : ''}`),
  },

  // Users endpoints (admin only)
  users: {
    list: (query?: { page?: number; limit?: number; role?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.role) params.append('role', query.role);
      if (query?.search) params.append('search', query.search);
      return fetchAPI(`/users?${params.toString()}`);
    },

    get: (id: string) => fetchAPI<UserResponse>(`/users/${id}`),

    update: (id: string, data: { email?: string; role?: string }) =>
      fetchAPI(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchAPI(`/users/${id}`, {
        method: 'DELETE',
      }),
  },
};

