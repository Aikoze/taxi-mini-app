// src/components/common/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-16 h-16 border-4 border-telegram-light border-t-telegram-primary rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  );
};

export default LoadingScreen;