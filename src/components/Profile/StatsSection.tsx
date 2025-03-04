// src/components/Profile/StatsSection.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { statsService, GroupStats, UserStats, DailyStats } from '../../api/statsService';
import { 
  Car, 
  CheckCircle, 
  LayoutGrid, 
  Calendar,
  Clock,
  BarChart,
  UserPlus
} from 'lucide-react';

const StatsSection: React.FC = () => {
  const { user } = useAuth();
  const [groupStats, setGroupStats] = useState<GroupStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer les statistiques du groupe
        const groupResponse = await statsService.getGroupStats();
        if (groupResponse.success && groupResponse.data) {
          setGroupStats(groupResponse.data);
        }

        // Récupérer les statistiques de l'utilisateur si connecté
        if (user?.telegram_id) {
          const userResponse = await statsService.getUserStats(user.telegram_id);
          if (userResponse.success && userResponse.data) {
            setUserStats(userResponse.data);
          }
        }

        // Récupérer les statistiques quotidiennes
        const dailyResponse = await statsService.getDailyStats();
        if (dailyResponse.success && dailyResponse.data) {
          setDailyStats(dailyResponse.data);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 h-8 w-40 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques du groupe */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart className="mr-2 text-telegram-primary" />
          Statistiques du groupe
        </h3>
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <LayoutGrid className="text-blue-600" size={20} />
            </div>
            <p className="text-xl font-bold text-gray-800">{groupStats?.total_rides || 0}</p>
            <p className="text-xs text-gray-500">Courses totales</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-xl font-bold text-gray-800">{groupStats?.completed_rides || 0}</p>
            <p className="text-xs text-gray-500">Terminées</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="bg-yellow-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <p className="text-xl font-bold text-gray-800">{groupStats?.pending_rides || 0}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
        </motion.div>
      </div>

      {/* Statistiques de l'utilisateur */}
      {userStats && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserPlus className="mr-2 text-telegram-primary" />
            Vos statistiques
          </h3>
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Car className="text-indigo-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-800">{userStats.created_rides}</p>
              <p className="text-xs text-gray-500">Courses créées</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="text-purple-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-800">{userStats.assigned_rides}</p>
              <p className="text-xs text-gray-500">Courses prises</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Statistiques quotidiennes */}
      {dailyStats && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 text-telegram-primary" />
            Statistiques du jour
          </h3>
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="bg-teal-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Car className="text-teal-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-800">{dailyStats.total_rides_today}</p>
              <p className="text-xs text-gray-500">Courses aujourd'hui</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="text-amber-600" size={20} />
              </div>
              <p className="text-xl font-bold text-gray-800">{dailyStats.assigned_rides_today}</p>
              <p className="text-xs text-gray-500">Courses assignées</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;
