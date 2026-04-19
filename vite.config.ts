import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { glob } from 'tinyglobby';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(async () => {
  const entries = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/*.test.*', '**/*.stories.*', '**/*.d.ts'],
  });

  return {
    plugins: [react(), dts({ tsconfigPath: './tsconfig.json', include: ['src'] })],
    build: {
      lib: {
        entry: Object.fromEntries(
          entries.map((file) => [file.replace('src/', '').replace(/\.(ts|tsx)$/, ''), resolve(__dirname, file)]),
        ),
        formats: ['es'],
      },
      rollupOptions: {
        // Externalize all deps + peer deps so they're not bundled
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@base-ui/react',
          /^@base-ui\/react\//,
          '@material/material-color-utilities',
          'lucide-react',
          'm3-ripple',
          'sonner',
        ],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          assetFileNames: 'styles/globals.[ext]',
        },
      },
      cssCodeSplit: false,
    },
  };
});
