import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

function chromeExtensionCopyPlugin() {
  return {
    name: 'chrome-extension-copy-plugin',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(distDir, 'manifest.json'));

      // Copy icons
      const iconsDir = resolve(distDir, 'icons');
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }

      const srcIconsDir = resolve(__dirname, 'public/icons');
      if (existsSync(srcIconsDir)) {
        for (const size of [16, 48, 128]) {
          const iconPath = resolve(srcIconsDir, `icon${size}.png`);
          if (existsSync(iconPath)) {
            copyFileSync(iconPath, resolve(iconsDir, `icon${size}.png`));
          }
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionCopyPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/serviceWorker.ts'),
        content: resolve(__dirname, 'src/content/contentScript.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  test: {
    environment: 'node',
    globals: true
  }
});
