import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Относительные пути нужны, чтобы ассеты работали на GitHub Pages
// как в корне домена, так и в /имя-репозитория/.
export default defineConfig({
  base: './',
  plugins: [react()],
});
