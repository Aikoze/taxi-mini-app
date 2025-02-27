// src/components/layout/MainLayout.tsx
import React, { ReactNode } from 'react';
import Header from './Header';
import TabBar from './TabBar';

interface MainLayoutProps {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTabBar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  title, 
  children, 
  showBackButton = false, 
  onBackClick,
  showTabBar = true
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header title={title} showBackButton={showBackButton} onBackClick={onBackClick} />
      
      <main className="flex-1 p-4 pb-20 overflow-auto">
        {children}
      </main>
      
      {showTabBar && <TabBar />}
    </div>
  );
};

export default MainLayout;