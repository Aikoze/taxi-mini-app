// src/pages/MyRidesPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import RideCard from '../components/MyRides/RideCard';
import { useRides } from '../contexts/RidesContext';
import LoadingScreen from '../components/common/LoadingScreen';
import {
  IoSad,
  IoAdd,
  IoSearch,
  IoClose,
} from 'react-icons/io5';
import Button from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Définition des filtres disponibles
const FILTERS = [
  { id: null, label: 'Toutes', color: 'bg-blue-500', gradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700', iconBg: 'bg-blue-200', iconColor: 'text-blue-600' },
  { id: 'pending', label: 'En attente', color: 'bg-yellow-500', gradient: 'from-yellow-50 to-yellow-100', textColor: 'text-yellow-700', iconBg: 'bg-yellow-200', iconColor: 'text-yellow-600' },
  { id: 'assigned', label: 'Assignées', color: 'bg-green-500', gradient: 'from-green-50 to-green-100', textColor: 'text-green-700', iconBg: 'bg-green-200', iconColor: 'text-green-600' },
  { id: 'completed', label: 'Terminées', color: 'bg-gray-500', gradient: 'from-gray-50 to-gray-100', textColor: 'text-gray-700', iconBg: 'bg-gray-200', iconColor: 'text-gray-600' }
];

const MyRidesPage: React.FC = () => {
  const { myRides, isLoading, fetchMyRides, completeRide } = useRides();
  const [completingRideId, setCompletingRideId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Charger les courses une seule fois au chargement
    fetchMyRides().then(() => setLastRefresh(new Date()));
  }, []); // Utiliser un tableau de dépendances vide pour n'exécuter qu'une seule fois

  const handleCompleteRide = async (rideId: number) => {
    try {
      setCompletingRideId(rideId);
      await completeRide(rideId);
    } finally {
      setCompletingRideId(null);
    }
  };

  const handleCallDriver = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getFilteredRides = useMemo(() => {
    if (!activeFilter) {
      return myRides.filter(ride =>
        searchTerm === '' ||
        ride.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoff_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return myRides.filter(ride =>
      (searchTerm === '' ||
        ride.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoff_address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (
        activeFilter === 'pending' ? ride.status === 'pending' :
          activeFilter === 'assigned' ? ride.status === 'assigned' :
            activeFilter === 'completed' ? ride.status === 'completed' :
              true
      )
    );
  }, [myRides, activeFilter, searchTerm]);

  const getCounts = () => {
    const counts = {
      pending: 0,
      assigned: 0,
      completed: 0,
      total: myRides.length,
      immediate: 0,
      scheduled: 0
    };

    myRides.forEach(ride => {
      if (ride.status === 'pending') counts.pending++;
      if (ride.status === 'assigned') counts.assigned++;
      if (ride.status === 'completed') counts.completed++;
      if (ride.is_immediate) counts.immediate++;
      else counts.scheduled++;
    });

    return counts;
  };

  const counts = getCounts();

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (isLoading && myRides.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <MainLayout title="Mes courses">
      {/* Barre de recherche */}
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white border-gray-200 focus:border-telegram-primary focus:ring-1 focus:ring-telegram-primary outline-none transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="text-gray-400" size={18} />
          </div>
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <IoClose className="text-gray-400 hover:text-gray-600" size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2 pb-1">
          {FILTERS.map(filter => {
            const count = filter.id === 'pending'
              ? counts.pending
              : filter.id === 'assigned'
                ? counts.assigned
                : filter.id === 'completed'
                  ? counts.completed
                  : counts.total;

            return (
              <button
                key={filter.id?.toString() || 'all'}
                className={`px-4 py-2 rounded-xl flex items-center whitespace-nowrap transition-all duration-200 ${activeFilter === filter.id
                  ? `${filter.color} text-white shadow-md`
                  : `bg-white border border-gray-200 ${filter.textColor} hover:bg-gray-100 hover:border-gray-300`
                  }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span className={`ml-1.5 ${activeFilter === filter.id
                  ? `bg-white bg-opacity-25 ${filter.textColor}`
                  : filter.iconBg
                  } text-xs font-medium px-2 py-0.5 rounded-full`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des courses */}
      {getFilteredRides.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter || 'all'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {getFilteredRides.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="mb-4"
                >
                  <RideCard
                    ride={ride}
                    onCompleteRide={handleCompleteRide}
                    onCallDriver={handleCallDriver}
                    isLoading={completingRideId === ride.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 bg-gray-50 rounded-lg shadow-sm"
        >
          <IoSad size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune course trouvée</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {activeFilter
              ? `Vous n'avez pas de courses ${activeFilter === 'pending' ? 'en attente' :
                activeFilter === 'assigned' ? 'assignées' :
                  'terminées'
              } pour le moment.`
              : 'Vous n\'avez pas encore créé de courses.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => window.location.href = '/'}
              icon={<IoAdd />}
            >
              Créer une course
            </Button>

            {activeFilter !== null && (
              <Button
                variant="secondary"
                onClick={() => setActiveFilter(null)}
              >
                Voir toutes les courses
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Statistiques supplémentaires */}
      {myRides.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-sm"
        >
          <h3 className="font-bold mb-3">Répartition des courses</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-700">Immédiates: </span>
              <span className="text-sm font-bold ml-1">{counts.immediate}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm text-gray-700">Programmées: </span>
              <span className="text-sm font-bold ml-1">{counts.scheduled}</span>
            </div>
          </div>
        </motion.div>
      )}
    </MainLayout>
  );
};

export default MyRidesPage;