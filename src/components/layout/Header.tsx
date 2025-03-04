// src/components/layout/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, onBackClick }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-telegram-primary text-white p-4 shadow-md">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="mr-2 p-1 rounded-full hover:bg-telegram-dark focus:outline-none"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-lg font-bold text-center flex-1">{title}</h1>
      </div>
    </header>
  );
};

export default Header;