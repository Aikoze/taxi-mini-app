// src/hooks/useAutoAssignRide.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ridesService } from '../api/ridesService';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from './useTelegram';

/**
 * Hook personnalisé pour gérer l'assignation automatique des courses dont le timer a expiré
 */
export const useAutoAssignRide = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showAlert } = useTelegram();

  // Mutation pour l'assignation automatique
  const {
    mutate: autoAssignRide,
    isPending,
    error,
    isSuccess,
    data,
    reset
  } = useMutation({
    mutationFn: async (rideId: number) => {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      return await ridesService.autoAssignRide(rideId);
    },
    onSuccess: (response) => {
      // Journalisation détaillée pour déboguer
      console.log('Réponse d\'assignation automatique reçue:', response);
      console.log('Utilisateur actuel:', user?.telegram_id, 'Type:', typeof user?.telegram_id);
      console.log('Chauffeur assigné:', response?.data?.assigned_to, 'Type:', typeof response?.data?.assigned_to);

      // Invalider les requêtes pour forcer le rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['availableRides'] });
      queryClient.invalidateQueries({ queryKey: ['rideAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['myRides'] });

      // Si la course a été assignée à l'utilisateur courant (vérification plus robuste)
      if (response?.data?.assigned_to &&
        user?.telegram_id &&
        response.data.assigned_to.toString() === user.telegram_id.toString()) {
        console.log('Notification d\'assignation envoyée!');
        showAlert('Une course vous a été assignée automatiquement !');
      }

      // Rafraîchir la liste des courses
      ridesService.getAvailableRides();
    },
    onError: (error: any) => {
      // Certaines erreurs sont normales et attendues, comme lorsque la course n'est plus en attente
      // ou qu'aucun chauffeur n'a exprimé d'intérêt
      const errorMessage = error?.message || 'Erreur inconnue';
      const expectedErrors = [
        'La course n\'est plus en attente',
        'Aucun chauffeur n\'a exprimé d\'intérêt pour cette course'
      ];

      if (expectedErrors.some(msg => errorMessage.includes(msg))) {
        console.log('Info assignation automatique:', errorMessage);
        // Invalider les requêtes pour forcer le rafraîchissement des données si le message est  que la course n'est plus en attente
        if (errorMessage === 'La course n\'est plus en attente') {
          queryClient.invalidateQueries({ queryKey: ['availableRides'] });
          queryClient.invalidateQueries({ queryKey: ['rideAssignments'] });
          queryClient.invalidateQueries({ queryKey: ['myRides'] });
        }
        // Si le message est  que la course n'est plus en attente
        if (errorMessage === 'Aucun chauffeur n\'a exprimé d\'intérêt pour cette course') {

        }
      } else {
        console.error('Erreur lors de l\'assignation automatique:', error);
      }
    }
  });

  return {
    autoAssignRide,
    isPending,
    error,
    isSuccess,
    data,
    reset
  };
};
