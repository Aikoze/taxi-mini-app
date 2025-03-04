// src/App.tsx
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RidesProvider } from './contexts/RidesContext';
import LoadingScreen from './components/common/LoadingScreen';
import { useTelegram } from './hooks/useTelegram';
import CreateRidePage from './pages/CreateRidePage';
import TakeRidePage from './pages/TakeRidePage';
import ProfilePage from './pages/ProfilePage';
import MyRidesPage from './pages/MyRidesPages';
import RideDetailPage from './pages/RideDetailPage';
import TelegramDebugPanel from './components/common/TelegramDebugPanel';
import WebApp from '@twa-dev/sdk';
import { Toaster } from 'sonner'

// Route protégée qui nécessite une authentification
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RidesProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CreateRidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rides"
          element={
            <ProtectedRoute>
              <MyRidesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/take-ride"
          element={
            <ProtectedRoute>
              <TakeRidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ride/:id"
          element={
            <ProtectedRoute>
              <RideDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </RidesProvider>
  );
};

const App: React.FC = () => {
  const telegram = useTelegram();
  const { inTelegram } = telegram;
  const _window = window as any;

  // Détecter si window.Telegram est disponible pour logs de diagnostic
  const hasWindowTelegram = !!_window.Telegram;

  // Log pour déboguer l'état initial
  useEffect(() => {
    console.log('%c[App] Démarrage de l\'application', 'color: green; font-weight: bold');
    console.log('[App] Version:', import.meta.env.VITE_APP_VERSION || 'Développement');
    console.log('[App] Environnement:', import.meta.env.MODE);
    console.log('[App] API URL:', import.meta.env.VITE_API_URL);
    console.log('[App] Détection Telegram:', inTelegram ? 'OUI' : 'NON');
    console.log('[App] État Telegram:', {
      telegramDetected: telegram.telegramDetected,
      initialized: telegram.initialized,
      user: telegram.user,
    });
    
    // Diagnostic plus détaillé pour déterminer pourquoi Telegram n'est pas détecté
    console.log('[App] window.Telegram est', hasWindowTelegram ? 'disponible' : 'non disponible');

    // Vérifier si l'application est dans un iframe (typique pour les mini-apps Telegram)
    const isInIframe = window !== window.parent;
    console.log('[App] Est dans un iframe:', isInIframe ? 'OUI' : 'NON');

    // Logs sur l'URL et User-Agent
    console.log('[App] URL:', window.location.href);
    console.log('[App] UserAgent:', navigator.userAgent);

    // Vérifier si window.Telegram existe
    if (window.Telegram) {
      console.log('[App] window.Telegram est disponible');
    } else {
      console.warn('[App] window.Telegram n\'est PAS disponible');
    }

    // Vérifier si nous sommes dans un iframe
    const isInIframe = window !== window.parent;
    console.log('[App] Est dans un iframe:', isInIframe ? 'OUI' : 'NON');

    // Afficher l'URL complète
    console.log('[App] URL:', window.location.href);
    console.log('[App] UserAgent:', navigator.userAgent);
  }, [inTelegram, telegram]);

  // Initialize Telegram WebApp
  useEffect(() => {
    try {
      console.log('%c[App] Initialisation de WebApp.ready()', 'color: blue; font-weight: bold');
      WebApp.ready();
      console.log('[App] WebApp.ready() initialisé avec succès');
      
      // Afficher les propriétés de WebApp pour déboguer
      console.log('[App] WebApp properties:', {
        platform: WebApp.platform,
        version: WebApp.version,
        colorScheme: WebApp.colorScheme,
        themeParams: WebApp.themeParams,
        isExpanded: WebApp.isExpanded,
        viewportHeight: WebApp.viewportHeight,
        viewportStableHeight: WebApp.viewportStableHeight,
        headerColor: WebApp.headerColor,
        backgroundColor: WebApp.backgroundColor,
        initDataUnsafe: WebApp.initDataUnsafe ? 'présent' : 'absent',
      });
      
      // Vérifier si l'utilisateur Telegram est disponible
      if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        console.log('[App] Données utilisateur Telegram détectées:', {
          id: WebApp.initDataUnsafe.user.id,
          username: WebApp.initDataUnsafe.user.username,
        });
      } else {
        console.warn('[App] Aucune donnée utilisateur Telegram détectée dans WebApp.initDataUnsafe');
      }
    } catch (error) {
      console.error('[App] Erreur lors de l\'initialisation de Telegram WebApp:', error);
    }
  }, []);

  // Log le rendu du composant
  useEffect(() => {
    console.log('%c[App] Rendu du composant App', 'color: green; font-weight: bold');
  });

  return (
    <div className="App max-w-md mx-auto h-screen">
      <Toaster closeButton={true} duration={300} />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>

      {/* Bannière de débogage améliorée */}
      <div className="fixed top-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 z-50 flex flex-col items-end">
        <div>{import.meta.env.DEV ? 'DEV' : 'PROD'} | {inTelegram ? 'TG' : 'WEB'}</div>
        <div>Init: {telegram.initialized ? 'OK' : 'NON'}</div>
        <div>TG User: {telegram.user ? '✔' : '✖'}</div>
      </div>

      {!inTelegram && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-4 text-center text-yellow-800">
          <p className="mb-2">Cette application est conçue pour fonctionner dans Telegram.</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
            onClick={() => {
              console.log('[App] Activation forcée du mode Telegram');
              window.location.href = `${window.location.pathname}?telegram=true`;
            }}
          >
            Forcer le mode Telegram
          </button>
        </div>
      )}

    </div>
  );
};

export default App;