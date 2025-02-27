// src/pages/ProfilePage.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Registration from '../components/Profile/Registration';
import LoadingScreen from '../components/common/LoadingScreen';
import Card from '../components/common/Card';

const ProfilePage: React.FC = () => {
  const { user, telegramUser, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <MainLayout title="Profil">
      {!isAuthenticated ? (
        <div>
          {telegramUser ? (
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-telegram-primary text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  {telegramUser.first_name?.charAt(0) || ''}
                  {telegramUser.last_name?.charAt(0) || ''}
                </div>
                <h2 className="mt-2 text-xl font-bold">
                  {telegramUser.first_name} {telegramUser.last_name}
                </h2>
                {telegramUser.username && (
                  <p className="text-gray-600">@{telegramUser.username}</p>
                )}
              </div>
              
              <Registration onSuccess={() => window.location.reload()} />
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">
                Veuillez ouvrir cette application depuis Telegram.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Card>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-telegram-primary text-white flex items-center justify-center text-xl font-bold mr-4">
                {user?.first_name?.charAt(0) || ''}
                {user?.last_name?.charAt(0) || ''}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {user?.first_name} {user?.last_name}
                </h2>
                {user?.username && (
                  <p className="text-gray-600">@{user.username}</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Téléphone</p>
                  <p className="font-medium">{user?.phone_number}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Adresse</p>
                  <p className="font-medium">{user?.address}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-bold mb-4">Statistiques</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-telegram-primary">12</p>
                <p className="text-sm text-gray-500">Courses créées</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">8</p>
                <p className="text-sm text-gray-500">Courses prises</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">3</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default ProfilePage;