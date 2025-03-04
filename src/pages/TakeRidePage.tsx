// src/pages/TakeRidePage.tsx
import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import AvailableRideCard from '../components/TakeRide/AvailableRideCard';
import InterestedRidesBar from '../components/TakeRide/InterestedRidesBar';
import RideAssignmentAlert from '../components/TakeRide/RideAssignmentAlert';
import { useRides } from '../contexts/RidesContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { RefreshCw, Frown, Car, CheckCircle, Filter, Clock } from 'lucide-react';
import Button from '../components/common/Button';
import { useTelegram } from '../hooks/useTelegram';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { useRideAssignments } from '../hooks/useRideAssignments';
import { useQuery } from '@tanstack/react-query';
import { ridesService } from '../api/ridesService';

const TakeRidePage: React.FC = () => {
  const { showInterest, removeInterest, interestedRides, updateRide, fetchAvailableRides: contextFetchRides, availableRides: contextRides } = useRides();
  const { showAlert } = useTelegram();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    immediate: false,
    scheduled: false,
    commission100: false,
    commission55: false,
    direct: false,
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Utiliser le hook personnalisé pour gérer les attributions de courses
  const {
    showAssignmentAlert,
    currentAssignment,
    handleCloseAlert
  } = useRideAssignments(interestedRides);

  // Utiliser React Query pour récupérer les courses disponibles
  const {
    data: availableRides = contextRides,
    isLoading,
    refetch: fetchAvailableRides
  } = useQuery({
    queryKey: ['availableRides'],
    queryFn: async () => {
      // Au lieu de retourner juste contextRides, retournez le résultat de l'API directement
      const rides = await ridesService.getAvailableRides();
      return rides; // Retourne la valeur fraîche de l'API, pas la référence au state
    },
    initialData: contextRides
  });

  const handleShowInterest = async (rideId: number, location: { latitude: number; longitude: number }) => {
    try {
      const success = await showInterest(rideId, location);

      if (success) {
        showAlert('Votre intérêt a été enregistré avec succès !');
      } else {
        showAlert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'expression d\'intérêt:', error);
      showAlert('Une erreur est survenue. Veuillez réessayer.');
    }
  };


  const handleAssignExpiredRide = async (rideId: number) => {
    try {
      const success = await updateRide(rideId, { status: 'assigned' });
      if (success) {
        showAlert('Course affectée');
      } else {
        showAlert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'intérêt:', error);
      showAlert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleRemoveInterest = async (rideId: number) => {
    try {
      const success = await removeInterest(rideId);

      if (success) {
        showAlert('Votre intérêt a été retiré avec succès !');
      } else {
        showAlert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'intérêt:', error);
      showAlert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleRefresh = () => {
    fetchAvailableRides().then(() => {
      setLastRefresh(new Date());
      showAlert('Liste des courses actualisée');
    });
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Appliquer les filtres
  const applyFilters = (rides: any[]) => {
    // Si aucun filtre n'est actif, retourner toutes les courses
    if (!Object.values(filters).some(value => value)) {
      return rides;
    }

    return rides.filter(ride => {
      // Filtrer par type de course (immédiate ou programmée)
      const matchesImmediateFilter = filters.immediate && ride.is_immediate;
      const matchesScheduledFilter = filters.scheduled && !ride.is_immediate;

      // Filtrer par méthode de paiement
      const matches100Filter = filters.commission100 && ride.payment_method === '100%';
      const matches55Filter = filters.commission55 && ride.payment_method === '55%';
      const matchesDirectFilter = filters.direct && ride.payment_method === 'direct';

      // Vérifier si la course correspond à au moins un des filtres actifs pour chaque catégorie
      const matchesTypeFilter = (filters.immediate || filters.scheduled)
        ? (matchesImmediateFilter || matchesScheduledFilter)
        : true;

      const matchesPaymentFilter = (filters.commission100 || filters.commission55 || filters.direct)
        ? (matches100Filter || matches55Filter || matchesDirectFilter)
        : true;

      return matchesTypeFilter && matchesPaymentFilter;
    });
  };

  // Séparer les courses avec intérêt du reste
  const interestedRidesList = availableRides.filter(ride => interestedRides.includes(ride.id));

  // Appliquer les filtres utilisateur aux courses sans intérêt
  const filteredRides = applyFilters(availableRides);

  // Statistiques
  const immediateCount = availableRides.filter(ride => ride.is_immediate).length;
  const scheduledCount = availableRides.filter(ride => !ride.is_immediate).length;
  const commission100Count = availableRides.filter(ride => ride.payment_method === '100%').length;
  const commission55Count = availableRides.filter(ride => ride.payment_method === '55%').length;
  const directCount = availableRides.filter(ride => ride.payment_method === 'direct').length;

  if (isLoading && availableRides.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <MainLayout title="Courses disponibles">

      {/* Courses avec intérêt */}
      {interestedRidesList.length > 0 && (
        <InterestedRidesBar
          rides={interestedRidesList}
          onRemoveInterest={handleRemoveInterest}
          className="mb-4"
        />
      )}

      {/* Actions et filtres */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Button
            variant="secondary"
            icon={<Filter />}
            onClick={() => setShowFilters(!showFilters)}
            className="mr-2"
          >
            Filtres {Object.values(filters).filter(Boolean).length > 0 &&
              <span className="ml-1 bg-telegram-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                {Object.values(filters).filter(Boolean).length}
              </span>
            }
          </Button>

        </div>
      </div>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-bold mb-3">Filtrer par:</h3>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  className={`py-2 px-3 rounded-lg flex items-center justify-between ${filters.immediate ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => toggleFilter('immediate')}
                >
                  <span>Immédiat</span>
                  {immediateCount > 0 && (
                    <span className={`text-xs ${filters.immediate ? 'bg-blue-200' : 'bg-gray-100'} px-2 py-1 rounded-full`}>
                      {immediateCount}
                    </span>
                  )}
                </button>

                <button
                  className={`py-2 px-3 rounded-lg flex items-center justify-between ${filters.scheduled ? 'bg-purple-100 text-purple-700' : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => toggleFilter('scheduled')}
                >
                  <span>Programmé</span>
                  {scheduledCount > 0 && (
                    <span className={`text-xs ${filters.scheduled ? 'bg-purple-200' : 'bg-gray-100'} px-2 py-1 rounded-full`}>
                      {scheduledCount}
                    </span>
                  )}
                </button>

                <button
                  className={`py-2 px-3 rounded-lg flex items-center justify-between ${filters.commission100 ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => toggleFilter('commission100')}
                >
                  <span>100%</span>
                  {commission100Count > 0 && (
                    <span className={`text-xs ${filters.commission100 ? 'bg-green-200' : 'bg-gray-100'} px-2 py-1 rounded-full`}>
                      {commission100Count}
                    </span>
                  )}
                </button>

                <button
                  className={`py-2 px-3 rounded-lg flex items-center justify-between ${filters.commission55 ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => toggleFilter('commission55')}
                >
                  <span>55%</span>
                  {commission55Count > 0 && (
                    <span className={`text-xs ${filters.commission55 ? 'bg-blue-200' : 'bg-gray-100'} px-2 py-1 rounded-full`}>
                      {commission55Count}
                    </span>
                  )}
                </button>

                <button
                  className={`py-2 px-3 rounded-lg flex items-center justify-between ${filters.direct ? 'bg-amber-100 text-amber-700' : 'bg-white border border-gray-200'
                    }`}
                  onClick={() => toggleFilter('direct')}
                >
                  <span>Direct</span>
                  {directCount > 0 && (
                    <span className={`text-xs ${filters.direct ? 'bg-amber-200' : 'bg-gray-100'} px-2 py-1 rounded-full`}>
                      {directCount}
                    </span>
                  )}
                </button>
              </div>

              {Object.values(filters).some(Boolean) && (
                <button
                  className="text-sm text-telegram-primary font-medium"
                  onClick={() => setFilters({
                    immediate: false,
                    scheduled: false,
                    commission100: false,
                    commission55: false,
                    direct: false,
                  })}
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des courses */}
      {filteredRides.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRides.map(ride => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AvailableRideCard
                  ride={ride}
                  onShowInterest={handleShowInterest}
                  handleAssignExpiredRide={handleAssignExpiredRide}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 bg-gray-50 rounded-lg shadow-sm"
        >
          <Frown size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune course disponible</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {interestedRides.length > 0 && filteredRides.length === 0
              ? 'Vous avez déjà exprimé votre intérêt pour toutes les courses disponibles.'
              : Object.values(filters).some(Boolean)
                ? 'Aucune course ne correspond à vos filtres actuels.'
                : 'Il n\'y a actuellement aucune course disponible.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {Object.values(filters).some(Boolean) && (
              <Button
                variant="secondary"
                onClick={() => setFilters({
                  immediate: false,
                  scheduled: false,
                  commission100: false,
                  commission55: false,
                  direct: false,
                })}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </motion.div>
      )}



      {/* Alerte d'attribution de course */}
      {currentAssignment && (
        <RideAssignmentAlert
          ride={currentAssignment.ride}
          isAssigned={currentAssignment.isAssigned}
          onClose={handleCloseAlert}
          visible={showAssignmentAlert}
        />
      )}
    </MainLayout>
  );
};

export default TakeRidePage;