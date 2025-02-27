import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupTelegramMock } from './utils/telegramMock'


// Initialiser le mock uniquement en développement
if (import.meta.env.DEV) {
  setupTelegramMock();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
