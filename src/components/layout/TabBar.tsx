// src/components/layout/TabBar.tsx
import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PlusCircle, ListOrdered, Search, UserCircle, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const TabBar: React.FC = () => {
  const location = useLocation();

  // Effet pour remonter en haut de la page lors du changement d'onglet
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Définition des onglets avec leurs propriétés
  const tabs = [
    {
      path: '/',
      label: 'Créer',
      icon: PlusCircle,
      color: 'text-telegram-primary',
      gradient: 'from-telegram-primary to-telegram-primary'
    },
    {
      path: '/my-rides',
      label: 'Mes courses',
      icon: ListOrdered,
      color: 'text-telegram-primary',
      gradient: 'from-telegram-primary to-telegram-primary'
    },
    {
      path: '/take-ride',
      label: 'Prendre',
      icon: Search,
      color: 'text-telegram-primary',
      gradient: 'from-telegram-primary to-telegram-primary'
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: UserCircle,
      color: 'text-telegram-primary',
      gradient: 'from-telegram-primary to-telegram-primary'
    }
  ];

  // Fonction pour gérer le clic sur un onglet
  const handleTabClick = () => {
    // Remonter en haut de la page avec une animation fluide
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-1 z-10 shadow-lg">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300"
              onClick={handleTabClick}
            >
              {/* Icône avec animation */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className={`relative z-10 ${isActive ? tab.color : 'text-gray-500'}`}
              >
                <Icon size={26} />

                {/* Indicateur de notification (exemple pour l'onglet "Mes courses") */}
                {tab.path === '/my-rides' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    2
                  </motion.div>
                )}
              </motion.div>

              {/* Texte avec animation */}
              <motion.span
                className={`text-xs mt-1 font-medium ${isActive ? tab.color : 'text-gray-500'}`}
                animate={{
                  opacity: isActive ? 1 : 0.7
                }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>

              {/* Indicateur de ligne active en bas */}
              {isActive && (
                <motion.div
                  className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-t-full bg-gradient-to-r ${tab.gradient}`}
                  layoutId="activeIndicator"
                />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Effet de flou pour donner une impression de profondeur */}
      <div className="absolute bottom-full left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent"></div>
    </nav>
  );
};

export default TabBar;