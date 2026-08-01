import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

// The docs site consumes the library straight from source rather than from `dist`.
// Demos can then be written exactly as a consumer would write them
// (`import { Button } from 'm3you'`) while still hot-reloading on component edits.
const libRoot = fileURLToPath(new URL('../src', import.meta.url));

export default defineConfig({
  server: {
    port: 3000,
    fs: {
      // `../src` lives outside the Vite root; allow the dev server to serve it.
      allow: ['..'],
    },
  },
  plugins: [
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },

      // Listing `/` here does not help: in SPA mode `_shell.html` *is* the root
      // render, so no index.html is emitted either way. scripts/postbuild.ts
      // copies the shell into place instead.
      pages: [{ path: '/docs' }, { path: '/api/search' }, { path: 'llms-full.txt' }, { path: 'llms.txt' }],
    }),
    react(),
    // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
    nitro(),
  ],
  resolve: {
    tsconfigPaths: true,
    // The library is imported from `../src`, which resolves React from the repo root
    // while docs code resolves it from `docs/`. Without deduping, two React instances
    // load and every hook in a library component throws.
    dedupe: ['react', 'react-dom', '@base-ui/react'],
    alias: [
      { find: /^m3you\/styles\.css$/, replacement: `${libRoot}/styles/globals.css` },
      { find: /^m3you$/, replacement: `${libRoot}/index.tsx` },
      { find: 'tslib', replacement: 'tslib/tslib.es6.js' },
    ],
  },
});
