import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_TRADING_UI_BASE || '/'

  return {
    base,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      strictPort: true,
    },
  }
})
