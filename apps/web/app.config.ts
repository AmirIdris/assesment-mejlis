import { createApp } from 'vinxi';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default createApp({
  compatibilityDate: '2026-01-03',
  routers: [
    {
      name: 'server',
      type: 'http',
      handler: './app/entry.server.tsx',
      plugins: () => [react(), tsconfigPaths()],
    },
    {
      name: 'client',
      type: 'client',
      handler: './app/entry.client.tsx',
      plugins: () => [react(), tsconfigPaths()],
    },
  ],
});

