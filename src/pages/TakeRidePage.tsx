// src/pages/TakeRidePage.tsx
import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import AvailableRideCard from '../components/TakeRide/AvailableRideCard';
import { useRides } from '../contexts/RidesContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { IoReload, IoSad } from 'react-icons/io5';
import Button from '../components/common/Button';
import { useTelegram } from '../hooks/useTelegram';

const TakeRidePage: React.FC = () => {
  const { availableRides, isLoading, fetchAvailableRides, showInterest } = useRides();
  const [submittedRideIds, setSubmittedRideIds] = useState<number[]>([]);
  const { showAlert } = useTelegram();
  
  useEffect(() => {
    // Charger les courses disponibles une seule fois au chargement
    fetchAvailableRides();
    
    // Rafraîchir les courses disponibles toutes les 30 secondes
    const interval = setInterval(() => {
      fetchAvailableRides();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);  // Utiliser un tableau de dépendances vide pour n'exécuter qu'une seule fois
  
  const handleShowInterest = async (rideId: number, location: { latitude: number; longitude: number }) => {
    try {
      const success = await showInterest(rideId, location);
      
      if (success) {
        // Ajouter l'ID à la liste des courses soumises
        setSubmittedRideIds(prev => [...prev, rideId]);
        showAlert('Votre intérêt a été enregistré avec succès !');
      } else {
        showAlert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'expression d\'intérêt:', error);
      showAlert('Une erreur est survenue. Veuillez réessayer.');
    }
  };
  
  // Filtrer les courses déjà soumises
  const filteredRides = availableRides.filter(ride => !submittedRideIds.includes(ride.id));
  
  if (isLoading && availableRides.length === 0) {
    return <LoadingScreen />;
  }
  
  return (
    <MainLayout title="Courses disponibles">
      <div className="flex justify-end mb-4">
        <Button
          variant="secondary"
          icon={<IoReload />}
          onClick={() => fetchAvailableRides()}
          isLoading={isLoading && availableRides.length > 0}
        >
          Actualiser
        </Button>
      </div>
      
      {filteredRides.length > 0 ? (
        <div>
          {filteredRides.map(ride => (
            <AvailableRideCard
              key={ride.id}
              ride={ride}
              onShowInterest={handleShowInterest}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <IoSad size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune course disponible</h3>
          <p className="text-gray-600 mb-6">
            {submittedRideIds.length > 0 
              ? 'Vous avez déjà exprimé votre intérêt pour toutes les courses disponibles.' 
              : 'Il n\'y a actuellement aucune course disponible.'}
          </p>
          <Button
            variant="primary"
            onClick={() => fetchAvailableRides()}
          >
            Actualiser
          </Button>
        </div>
      )}
      
      {submittedRideIds.length > 0 && (
        <div className="mt-6 p-4 bg-telegram-light rounded-lg">
          <h3 className="font-bold mb-2">Intérêt exprimé</h3>
          <p className="text-sm">
            Vous avez exprimé votre intérêt pour {submittedRideIds.length} course(s). 
            Vous serez notifié si vous êtes sélectionné.
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default TakeRidePage;