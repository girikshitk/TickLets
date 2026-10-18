import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['three'],
  },
  // The deploy workflow passes --base=/<repo-name>/ so assets resolve on GitHub Pages.
});
