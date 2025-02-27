// src/pages/MyRidesPage.tsx
import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import RideCard from '../components/MyRides/RideCard';
import { useRides } from '../contexts/RidesContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { IoReload, IoSad } from 'react-icons/io5';
import Button from '../components/common/Button';

const MyRidesPage: React.FC = () => {
  const { myRides, isLoading, fetchMyRides, completeRide } = useRides();
  const [completingRideId, setCompletingRideId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  useEffect(() => {
    // Charger les courses une seule fois au chargement
    fetchMyRides();
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
  
  const getFilteredRides = () => {
    if (!activeFilter) return myRides;
    return myRides.filter(ride => ride.status === activeFilter);
  };
  
  const filteredRides = getFilteredRides();
  
  if (isLoading && myRides.length === 0) {
    return <LoadingScreen />;
  }
  
  return (
    <MainLayout title="Mes courses">
      <div className="mb-4 flex overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
            activeFilter === null 
              ? 'bg-telegram-primary text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActiveFilter(null)}
        >
          Toutes
        </button>
        <button
          className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
            activeFilter === 'pending' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActiveFilter('pending')}
        >
          En attente
        </button>
        <button
          className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
            activeFilter === 'assigned' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActiveFilter('assigned')}
        >
          Assignées
        </button>
        <button
          className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
            activeFilter === 'completed' 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActiveFilter('completed')}
        >
          Terminées
        </button>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button
          variant="secondary"
          icon={<IoReload />}
          onClick={() => fetchMyRides()}
          isLoading={isLoading && myRides.length > 0}
        >
          Actualiser
        </Button>
      </div>
      
      {filteredRides.length > 0 ? (
        <div>
          {filteredRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              onCompleteRide={handleCompleteRide}
              onCallDriver={handleCallDriver}
              isLoading={completingRideId === ride.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <IoSad size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune course trouvée</h3>
          <p className="text-gray-600 mb-6">
            {activeFilter 
              ? `Vous n'avez pas de courses ${
                  activeFilter === 'pending' ? 'en attente' : 
                  activeFilter === 'assigned' ? 'assignées' : 
                  'terminées'
                } pour le moment.`
              : 'Vous n\'avez pas encore créé de courses.'}
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/'}
          >
            Créer une course
          </Button>
        </div>
      )}
    </MainLayout>
  );
};

export default MyRidesPage;