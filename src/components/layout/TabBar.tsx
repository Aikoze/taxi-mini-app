// src/components/layout/TabBar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { IoAddCircle, IoList, IoSearch, IoPersonCircle } from 'react-icons/io5';

const TabBar: React.FC = () => {
  const location = useLocation();
  
  const getActiveClass = (path: string) => {
    return location.pathname === path 
      ? 'text-telegram-primary border-t-2 border-telegram-primary' 
      : 'text-gray-500';
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-10">
      <div className="flex justify-around">
        <NavLink 
          to="/" 
          className={`flex flex-col items-center ${getActiveClass('/')}`}
        >
          <IoAddCircle size={24} />
          <span className="text-xs mt-1">Créer</span>
        </NavLink>
        
        <NavLink 
          to="/my-rides" 
          className={`flex flex-col items-center ${getActiveClass('/my-rides')}`}
        >
          <IoList size={24} />
          <span className="text-xs mt-1">Mes courses</span>
        </NavLink>
        
        <NavLink 
          to="/take-ride" 
          className={`flex flex-col items-center ${getActiveClass('/take-ride')}`}
        >
          <IoSearch size={24} />
          <span className="text-xs mt-1">Prendre</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={`flex flex-col items-center ${getActiveClass('/profile')}`}
        >
          <IoPersonCircle size={24} />
          <span className="text-xs mt-1">Profil</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default TabBar;