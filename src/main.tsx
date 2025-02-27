import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import { setupTelegramMock } from './utils/telegramMock'
import WebApp from '@twa-dev/sdk'

// Initialize mock only in development and if WebApp is not available
if (import.meta.env.DEV && !WebApp) {
  console.log('Initializing Telegram mock for development')
  setupTelegramMock();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
