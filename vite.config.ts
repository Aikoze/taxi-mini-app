import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Ignorer les erreurs TypeScript lors du build
    chunkSizeWarningLimit: 1000, // Augmenter la limite de taille des chunks pour éviter des avertissements
    rollupOptions: {
      // Ignorer les erreurs de build
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      }
    }
  },
  plugins: [
    react({
      // Désactiver la vérification TypeScript dans le plugin React
      typescript: {
        transpileOnly: true,
        noEmit: true
      }
    }),
    tailwindcss()
  ],
  server: {
    host: true, // Écoute sur toutes les adresses réseau, y compris LAN et public
    port: 5173,
    strictPort: true, // Échoue si le port est déjà utilisé
    proxy: {
      // Configuration du proxy en développement
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Ne pas modifier le chemin
      }
    },
    cors: true, // Activer CORS pour toutes les requêtes
    // hmr: {
    //   // Options pour Hot Module Replacement
    //   clientPort: 443 // Force le port client HMR à 443 pour les tunnels HTTPS
    // },
    // allowedHosts: [
    //   'localhost',
    //   '127.0.0.1',
    //   'taxi-mini-app.loca.lt',
    //   '.loca.lt' // Autorise tous les sous-domaines loca.lt
    // ]
  }
})
