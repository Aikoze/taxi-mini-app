// src/components/TakeRide/hooks/useRideTimer.ts
import { useState, useEffect, useRef } from 'react';
import { getRemainingTime, getTimeProgressPercentage, checkIfExpired } from '../utils/timeUtils';

interface UseRideTimerProps {
  rideId: number;
  createdAt: string;
  isImmediate: boolean;
  status: string; 
  autoAssignRide: (id: number) => Promise<{ success: boolean; message?: string }>;
}

export const useRideTimer = ({
  rideId,
  createdAt,
  isImmediate,
  status,
  autoAssignRide
}: UseRideTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [hasBeenAssigned, setHasBeenAssigned] = useState<boolean>(false);
  const wasExpiredRef = useRef<boolean>(false);

  // Gérer le timer et l'assignation automatique
  useEffect(() => {
    // Si la course n'est pas en attente ou a déjà été assignée, on ne fait rien
    if (status !== 'pending' || hasBeenAssigned) {
      return;
    }

    // Vérifier si la course est déjà expirée au moment de l'initialisation
    const initialExpired = checkIfExpired(createdAt, isImmediate);
    setIsExpired(initialExpired);
    wasExpiredRef.current = initialExpired;

    // Si déjà expirée, déclencher l'assignation immédiatement
    if (initialExpired) {
      console.log(`La course #${rideId} est déjà expirée, assignation immédiate`);
      setHasBeenAssigned(true);
      
      autoAssignRide(rideId)
        .then((result) => {
          console.log(`Auto-assignation ${result.success ? 'réussie' : 'échouée'} pour la course #${rideId}`, result.message);
        })
        .catch(error => {
          console.log(`Erreur d'auto-assignation pour la course #${rideId}:`, error?.message || error);
          if (!error?.message?.includes("n'est plus en attente")) {
            setHasBeenAssigned(false);
          }
        });
    }

    const updateTimeRemaining = () => {
      // Vérifier encore une fois si la course est toujours en attente
      if (status !== 'pending' || hasBeenAssigned) {
        return;
      }

      // Mettre à jour les compteurs
      const remaining = getRemainingTime(createdAt, isImmediate);
      setTimeRemaining(remaining.formatted);
      setSecondsRemaining(remaining.totalSeconds);
      setIsUrgent(remaining.isUrgent);
      setProgressPercentage(getTimeProgressPercentage(createdAt, isImmediate));
      setIsExpired(remaining.isExpired);

      // Si la course vient d'expirer (transition de non-expirée à expirée)
      if (remaining.isExpired && !wasExpiredRef.current) {
        console.log(`Le timer de la course #${rideId} vient d'expirer, déclenchement de l'assignation automatique`);
        setHasBeenAssigned(true);

        autoAssignRide(rideId)
          .then((result) => {
            console.log(`Auto-assignation ${result.success ? 'réussie' : 'échouée'} pour la course #${rideId}`, result.message);
          })
          .catch(error => {
            console.log(`Erreur d'auto-assignation pour la course #${rideId}:`, error?.message || error);
            // Permettre une réassignation uniquement si l'erreur n'est pas due à un changement d'état
            if (!error?.message?.includes("n'est plus en attente")) {
              setHasBeenAssigned(false);
            }
          });
      }

      // Mettre à jour la référence pour le prochain check
      wasExpiredRef.current = remaining.isExpired;
    };

    // Mettre à jour immédiatement pour initialiser les compteurs
    updateTimeRemaining();

    // Puis mettre à jour toutes les secondes
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [rideId, createdAt, isImmediate, status, autoAssignRide, hasBeenAssigned]);

  return {
    timeRemaining,
    progressPercentage,
    isExpired,
    isUrgent,
    secondsRemaining,
    hasBeenAssigned
  };
};

export default useRideTimer;
