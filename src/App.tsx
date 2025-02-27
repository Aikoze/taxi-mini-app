// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RidesProvider } from './contexts/RidesContext';
import LoadingScreen from './components/common/LoadingScreen';
import { useTelegram } from './hooks/useTelegram';
import CreateRidePage from './pages/CreateRidePage';
import TakeRidePage from './pages/TakeRidePage';
import ProfilePage from './pages/ProfilePage';
import MyRidesPage from './pages/MyRidesPages';
import TelegramDebugPanel from './components/common/TelegramDebugPanel';

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

  return (
    <div className="App max-w-md mx-auto h-screen">
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>

      {!inTelegram && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-2 text-center text-yellow-800 text-sm">
          Cette application est conçue pour fonctionner dans Telegram.
        </div>
      )}

      {import.meta.env.DEV && <TelegramDebugPanel />}
    </div>
  );
};

export default App;