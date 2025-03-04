// src/pages/ProfilePage.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../hooks/useTelegram';
import MainLayout from '../components/layout/MainLayout';
import Registration from '../components/Profile/Registration';
import StatsSection from '../components/Profile/StatsSection';
import LoadingScreen from '../components/common/LoadingScreen';
import {
  Phone,
  Mail,
  Home,
  Car,
  CheckCircle,
  Clock,
  User,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user, telegramUser, isLoading, isAuthenticated } = useAuth();
  const { inTelegram } = useTelegram();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <MainLayout title="Profil">
      {!isAuthenticated ? (
        <div>
          {telegramUser ? (
            <div className="mb-6">
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-telegram-primary to-blue-400 text-white flex items-center justify-center text-2xl font-bold mx-auto shadow-lg">
                    {telegramUser.first_name?.charAt(0) || ''}
                    {telegramUser.last_name?.charAt(0) || ''}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                </div>
                <h2 className="mt-3 text-xl font-bold">
                  {telegramUser.first_name} {telegramUser.last_name}
                </h2>
                {telegramUser.username && (
                  <p className="text-gray-500">@{telegramUser.username}</p>
                )}
              </motion.div>

              <Registration onSuccess={() => window.location.reload()} />
            </div>
          ) : (
            <div className="text-center py-10">
              {inTelegram ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Informations utilisateur Telegram non disponibles.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Vous pouvez quand même vous inscrire en fournissant vos informations ci-dessous.
                  </p>
                  <Registration onSuccess={() => window.location.reload()} />
                </div>
              ) : (
                <p className="text-gray-600">
                  Veuillez ouvrir cette application depuis Telegram.
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* En-tête du profil */}
          <motion.div
            className="bg-gradient-to-r from-telegram-primary to-blue-500 rounded-xl p-6 text-white shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20  text-telegram-primary flex items-center justify-center text-xl font-bold mr-4 shadow-inner">
                {user?.first_name?.charAt(0) || ''}
                {user?.last_name?.charAt(0) || ''}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {user?.first_name} {user?.last_name}
                </h2>
                {user?.username && (
                  <p className="text-white text-opacity-80">@{user.username}</p>
                )}
                <div className="mt-2 inline-flex items-center text-green-400 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  En ligne
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section de statistiques */}
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StatsSection />
          </motion.div>

          {/* Informations personnelles */}
          <motion.div
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Informations personnelles</h3>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="flex items-center px-4 py-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Phone className="text-blue-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="text-sm font-medium">{user?.phone_number || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="flex items-center px-4 py-3">
                <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Mail className="text-purple-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{user?.email || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="flex items-center px-4 py-3">
                <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Home className="text-green-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Adresse</p>
                  <p className="text-sm font-medium">{user?.address || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="bg-white rounded-xl shadow-sm overflow-hidden mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Actions</h3>
            </div>

            <div className="divide-y divide-gray-100">
              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <User className="text-gray-600" size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Modifier mon profil</span>
                </div>
                <ChevronRight className="text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <LogOut className="text-red-600" size={16} />
                  </div>
                  <span className="text-sm font-medium text-red-600">Déconnexion</span>
                </div>
                <ChevronRight className="text-gray-400" />
              </button>
            </div>
          </motion.div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Taxi Mini App v1.0.0
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default ProfilePage;