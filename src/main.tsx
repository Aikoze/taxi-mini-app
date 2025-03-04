import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import { setupTelegramMock } from './utils/telegramMock'
import WebApp from '@twa-dev/sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Initialize mock only in development and if WebApp is not available
if (import.meta.env.DEV && !WebApp) {
  console.log('Initializing Telegram mock for development')
  setupTelegramMock();
}

// Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,              // Nombre de tentatives en cas d'échec
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
