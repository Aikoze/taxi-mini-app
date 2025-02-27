import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Écoute sur toutes les adresses réseau, y compris LAN et public
    port: 5173,
    strictPort: true, // Échoue si le port est déjà utilisé
    hmr: {
      // Options pour Hot Module Replacement
      clientPort: 443 // Force le port client HMR à 443 pour les tunnels HTTPS
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'taxi-mini-app.loca.lt',
      '.loca.lt' // Autorise tous les sous-domaines loca.lt
    ]
  }
})
