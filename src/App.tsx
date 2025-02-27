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
import TelegramDebugPanel from './components/common/TelegramDebugPanel';
import WebApp from '@twa-dev/sdk';

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
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </RidesProvider>
  );
};

const App: React.FC = () => {
  const { inTelegram } = useTelegram();

  // Initialize Telegram WebApp
  useEffect(() => {
    try {
      console.log('Initializing Telegram WebApp from App component');
      WebApp.ready();
      console.log('Telegram WebApp initialized successfully');
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
    }
  }, []);

  return (
    <div className="App max-w-md mx-auto h-screen">
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>

      {!inTelegram && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-4 text-center text-yellow-800">
          <p className="mb-2">Cette application est conçue pour fonctionner dans Telegram.</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
            onClick={() => window.location.href = `${window.location.pathname}?telegram=true`}
          >
            Forcer le mode Telegram
          </button>
        </div>
      )}

      {/* {import.meta.env.DEV && <TelegramDebugPanel />} */}
    </div>
  );
};

export default App;