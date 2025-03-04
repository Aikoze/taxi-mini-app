import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ridesService } from '../api/ridesService';
import { useRides } from '../contexts/RidesContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { Ride } from '../types/app';
import { supabase } from '../api/supabaseClient';

interface AssignmentResult {
  ride: Ride;
  isAssigned: boolean;
}

export const useRideAssignments = (interestedRideIds: number[]) => {
  const { user } = useAuth();
  const { fetchAvailableRides } = useRides();
  const queryClient = useQueryClient();
  const [newAssignments, setNewAssignments] = useState<AssignmentResult[]>([]);
  const [showAssignmentAlert, setShowAssignmentAlert] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentResult | null>(null);
  const [processedAssignments, setProcessedAssignments] = useState<number[]>([]);

  // Requête pour vérifier les attributions de courses
  const { data: assignmentData, isLoading, error } = useQuery({
    queryKey: ['rideAssignments', interestedRideIds],
    queryFn: async () => {
      if (!user || interestedRideIds.length === 0) return [];
      
      const results = await Promise.all(
        interestedRideIds.map(async (rideId) => {
          try {
            const result = await ridesService.getRideAssignment(rideId);
            
            if (result && result.data) {
              const ride = await ridesService.getRideById(rideId);
              
              if (ride && ride.data) {
                return {
                  rideId,
                  ride: ride.data,
                  assignedTo: result.data.assigned_to,
                  isAssigned: result.data.assigned_to === user.telegram_id.toString(),
                  isProcessed: result.data.is_processed
                };
              }
            }
            return null;
          } catch (error) {
            console.error(`Erreur lors de la vérification d'attribution pour la course #${rideId}:`, error);
            return null;
          }
        })
      );
      
      return results.filter(Boolean);
    },
    // On n'utilise plus refetchInterval à cause de Supabase Realtime
    enabled: interestedRideIds.length > 0 && !!user,
  });

  // Détecter les nouvelles attributions
  useEffect(() => {
    if (assignmentData && assignmentData.length > 0) {
      const newOnes = assignmentData.filter(
        (assignment) => 
          assignment.isProcessed && 
          !processedAssignments.includes(assignment.rideId)
      );

      if (newOnes.length > 0) {
        // Mettre à jour les courses disponibles
        fetchAvailableRides();
        
        // Préparer les nouvelles attributions pour l'affichage
        const assignmentResults = newOnes.map(assignment => ({
          ride: assignment.ride,
          isAssigned: assignment.isAssigned
        }));
        
        setNewAssignments(assignmentResults);
        
        // Mettre à jour la liste des attributions traitées
        setProcessedAssignments(prev => [
          ...prev, 
          ...newOnes.map(a => a.rideId)
        ]);
      }
    }
  }, [assignmentData, processedAssignments, fetchAvailableRides]);

  // Gérer l'affichage des alertes
  useEffect(() => {
    if (newAssignments.length > 0) {
      // Afficher la première nouvelle attribution
      setCurrentAssignment(newAssignments[0]);
      setShowAssignmentAlert(true);
    }
  }, [newAssignments]);

  // Fermer l'alerte et passer à la suivante
  const handleCloseAlert = useCallback(() => {
    setShowAssignmentAlert(false);
    
    // Attendre que l'animation de fermeture soit terminée
    setTimeout(() => {
      // Retirer l'attribution actuelle de la liste
      setNewAssignments(prev => prev.slice(1));
      
      // S'il y a d'autres attributions à afficher, montrer la suivante
      if (newAssignments.length > 1) {
        setCurrentAssignment(newAssignments[1]);
        setShowAssignmentAlert(true);
      } else {
        setCurrentAssignment(null);
      }
    }, 300);
  }, [newAssignments]);

  return {
    assignmentData,
    isLoading,
    error,
    showAssignmentAlert,
    currentAssignment,
    handleCloseAlert
  };
};
