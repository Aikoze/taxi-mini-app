// src/components/TakeRide/AvailableRideCardRefactored.tsx
import React, { useState } from 'react';
import { Ride } from '../../types/app';
import Card from '../common/Card';
import { IoCalendarOutline } from 'react-icons/io5';
import { useTelegram } from '../../hooks/useTelegram';
import { useAutoAssignRide } from '../../hooks/useAutoAssignRide';
import { useNavigate } from 'react-router-dom';
// Composants et hooks refactorisés
import ProgressBar from './components/ProgressBar';
import TimeIndicator from './components/TimeIndicator';
import RouteDisplay from './components/RouteDisplay';
import RideStatusBadges from './components/RideStatusBadges';
import RideTypePaymentInfo from './components/RideTypePaymentInfo';
import ActionButtons from './components/ActionButtons';
import { useRideTimer } from './hooks/useRideTimer';
import { formatDateTime } from './utils/timeUtils';

interface AvailableRideCardProps {
  ride: Ride;
  onShowInterest: (rideId: number, location: { latitude: number; longitude: number }) => Promise<void>;
  handleAssignExpiredRide: (rideId: number) => Promise<void>;
}

const AvailableRideCard: React.FC<AvailableRideCardProps> = ({
  ride,
  onShowInterest,
  handleAssignExpiredRide
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { requestLocation, showAlert } = useTelegram();
  const { autoAssignRide, isPending: isAutoAssigning } = useAutoAssignRide();
  const navigate = useNavigate(); // Utilisez le hook useNavigate

  // Créer une fonction compatible avec le type attendu par useRideTimer
  const handleAutoAssign = async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      // Appeler la fonction de mutation et retourner une promesse
      autoAssignRide(id);
      return { success: true };
    } catch (error) {
      console.error("Erreur dans handleAutoAssign:", error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  };

  // Utiliser le hook de timer refactorisé
  const {
    timeRemaining,
    progressPercentage,
    isExpired,
    isUrgent,
    secondsRemaining
  } = useRideTimer({
    rideId: ride.id,
    createdAt: ride.created_at,
    isImmediate: ride.is_immediate,
    status: ride.status,
    autoAssignRide: handleAutoAssign
  });

  // Obtenir le nom court des lieux s'ils sont disponibles
  const getLocationName = (location: string, savedLocation?: { short_name: string }) => {
    return savedLocation ? savedLocation.short_name : location;
  };

  const pickupLocation = getLocationName(ride.pickup_address, ride.pickup_location);
  const dropoffLocation = getLocationName(ride.dropoff_address, ride.dropoff_location);

  const handleInterestClick = async () => {
    try {
      setIsLoading(true);
      const location = await requestLocation();

      if (location) {
        console.log(`Course #${ride.id}, demande d'intérêt`);
        if (isExpired) {
          // Si le timer a expiré, assigner directement la course à l'utilisateur
          console.log(`Course #${ride.id} expirée, tentative d'assignation directe`);
          // on assigne directement la course au a l'utilisateur
          await handleAssignExpiredRide(ride.id);
          // Rediriger vers la page de confirmation de course assignée
          navigate(`/ride/${ride.id}`);
        } else {
          // Comportement normal pour les courses non expirées
          await onShowInterest(ride.id, location);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la demande de localisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Barre de progression du temps */}
      <ProgressBar
        timeProgress={progressPercentage}
        isImmediate={ride.is_immediate}
        isUrgent={isUrgent}
      />

      <div className="flex flex-col">
        {/* En-tête avec badges */}
        <div className="flex justify-between items-start mb-3">
          <RideStatusBadges
            isImmediate={ride.is_immediate}
            paymentMethod={ride.payment_method}
          />

          <TimeIndicator
            isImmediate={ride.is_immediate}
            isExpired={isExpired}
            isUrgent={isUrgent}
            timeRemaining={timeRemaining}
          />
        </div>

        {/* Titre et date */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-1">
            {pickupLocation} → {dropoffLocation}
          </h3>
          <div className="text-sm text-gray-600 flex items-center">
            <IoCalendarOutline className="mr-1" />
            {formatDateTime(ride.pickup_datetime)}
          </div>
        </div>

        {/* Trajet */}
        <RouteDisplay
          pickupAddress={ride.pickup_address}
          dropoffAddress={ride.dropoff_address}
        />

        {/* Informations supplémentaires */}
        <RideTypePaymentInfo
          isImmediate={ride.is_immediate}
          paymentMethod={ride.payment_method}
        />

        {/* Boutons d'action */}
        <ActionButtons
          rideId={ride.id}
          isImmediate={ride.is_immediate}
          isExpired={isExpired}
          isUrgent={isUrgent}
          timeRemaining={timeRemaining}
          progressPercentage={progressPercentage}
          isLoading={isLoading}
          handleInterestClick={handleInterestClick}
        />
      </div>
    </Card>
  );
};

export default AvailableRideCard;
