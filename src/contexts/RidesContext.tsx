// src/contexts/RidesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ride, SavedLocation } from '../types/app';
import { useAuth } from './AuthContext';
import { ridesService } from '../api/ridesService';
import { locationsService } from '../api/locationService';
import { supabase } from '../api/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'
// Types pour les états de chargement et d'erreur
interface LoadingState {
  myRides: boolean;
  availableRides: boolean;
  savedLocations: boolean;
  createRide: boolean;
  updateRide: boolean;
  interest: boolean;
  completeRide: boolean;
}

interface ErrorState {
  myRides: string | null;
  availableRides: string | null;
  savedLocations: string | null;
  createRide: string | null;
  updateRide: string | null;
  interest: string | null;
  completeRide: string | null;
}

interface RidesContextType {
  myRides: Ride[];
  availableRides: Ride[];
  savedLocations: SavedLocation[];
  loading: LoadingState;
  errors: ErrorState;
  interestedRides: number[];
  createRide: (rideData: Omit<Ride, 'id' | 'userId'>) => Promise<Ride>;
  updateRide: (rideId: number, rideData: Partial<Ride>) => Promise<Ride>;
  fetchMyRides: () => Promise<void>;
  fetchAvailableRides: () => Promise<void>;
  fetchSavedLocations: (category?: string) => Promise<SavedLocation[]>;
  showInterest: (rideId: number, location: { latitude: number; longitude: number }) => Promise<boolean>;
  removeInterest: (rideId: number) => Promise<boolean>;
  completeRide: (rideId: number) => Promise<boolean>;
  clearErrors: () => void;
}

const RidesContext = createContext<RidesContextType | undefined>(undefined);

const initialLoadingState: LoadingState = {
  myRides: false,
  availableRides: false,
  savedLocations: false,
  createRide: false,
  updateRide: false,
  interest: false,
  completeRide: false
};

const initialErrorState: ErrorState = {
  myRides: null,
  availableRides: null,
  savedLocations: null,
  createRide: null,
  updateRide: null,
  interest: null,
  completeRide: null
};

interface RidesProviderProps {
  children: ReactNode;
}

export const RidesProvider: React.FC<RidesProviderProps> = ({ children }) => {
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState<LoadingState>(initialLoadingState);
  const [errors, setErrors] = useState<ErrorState>(initialErrorState);
  const [interestedRides, setInterestedRides] = useState<number[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Utilitaire pour mettre à jour l'état de chargement
  const setLoadingState = (key: keyof LoadingState, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  // Utilitaire pour mettre à jour l'état d'erreur
  const setErrorState = (key: keyof ErrorState, value: string | null) => {
    setErrors(prev => ({ ...prev, [key]: value }));
  };

  // Fonction pour effacer toutes les erreurs
  const clearErrors = () => {
    setErrors(initialErrorState);
  };

  const fetchMyRides = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoadingState('myRides', true);
      setErrorState('myRides', null);

      const rides = await ridesService.getUserRides(user.telegram_id);
      setMyRides(rides);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('myRides', errorMessage);
    } finally {
      setLoadingState('myRides', false);
    }
  };

  const fetchAvailableRides = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoadingState('availableRides', true);
      setErrorState('availableRides', null);

      const rides = await ridesService.getAvailableRides();
      setAvailableRides(rides);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses disponibles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('availableRides', errorMessage);
      toast.error('Impossible de charger les courses disponibles');
    } finally {
      setLoadingState('availableRides', false);
    }
  };

  const fetchSavedLocations = async (category?: string): Promise<SavedLocation[]> => {
    try {
      setLoadingState('savedLocations', true);
      setErrorState('savedLocations', null);

      const locations = await locationsService.getLocations(category);
      setSavedLocations(locations);
      return locations;
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('savedLocations', errorMessage);
      toast.error('Impossible de charger les lieux enregistrés');
      return [];
    } finally {
      setLoadingState('savedLocations', false);
    }
  };

  const createRide = async (rideData: Omit<Ride, 'id' | 'userId'>): Promise<Ride> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      setLoadingState('createRide', true);
      setErrorState('createRide', null);

      const response = await ridesService.createRide({
        ...rideData,
        userId: user.telegram_id
      });

      if (response.success && response.data) {
        setMyRides(prevRides => [...prevRides, response.data]);
        toast.success('Course créée avec succès');
        return response.data;
      } else {
        throw new Error(response.error || 'Erreur lors de la création de la course');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('createRide', errorMessage);
      toast.error('Impossible de créer la course');
      throw error;
    } finally {
      setLoadingState('createRide', false);
    }
  };

  const updateRide = async (rideId: number, rideData: Partial<Ride>): Promise<Ride> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      setLoadingState('updateRide', true);
      setErrorState('updateRide', null);

      const data = {
        ...rideData,
        driverId: user.telegram_id // Utiliser telegram_id comme dans createRide
      };

      const response = await ridesService.updateRide(rideId, data);

      if (response.success && response.data) {
        // Mettre à jour la course localement sans refetch complet
        setMyRides(prevRides =>
          prevRides.map(ride =>
            ride.id === rideId ? { ...ride, ...response.data } : ride
          )
        );
        toast.success('Course mise à jour avec succès');
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour de la course');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('updateRide', errorMessage);
      toast.error('Impossible de mettre à jour la course');
      throw error;
    } finally {
      setLoadingState('updateRide', false);
    }
  };

  const showInterest = async (rideId: number, location: { latitude: number; longitude: number }): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingState('interest', true);
      setErrorState('interest', null);

      const response = await ridesService.showInterest(rideId, user.telegram_id, location);

      if (response.success) {
        // Mettre à jour la liste des courses avec intérêt (éviter les doublons)
        setInterestedRides(prev => {
          if (!prev.includes(rideId)) {
            return [...prev, rideId];
          }
          return prev;
        });
        toast.success('Intérêt enregistré avec succès');
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors de l\'enregistrement de l\'intérêt');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'intérêt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('interest', errorMessage);
      toast.error('Impossible d\'enregistrer votre intérêt');
      return false;
    } finally {
      setLoadingState('interest', false);
    }
  };

  const removeInterest = async (rideId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingState('interest', true);
      setErrorState('interest', null);

      const response = await ridesService.removeInterest(rideId, user.telegram_id);

      if (response.success) {
        // Retirer l'ID de la liste des courses avec intérêt
        setInterestedRides(prev => prev.filter(id => id !== rideId));
        toast.success('Intérêt retiré avec succès');
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors du retrait de l\'intérêt');
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'intérêt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('interest', errorMessage);
      toast.error('Impossible de retirer votre intérêt');
      return false;
    } finally {
      setLoadingState('interest', false);
    }
  };

  const completeRide = async (rideId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoadingState('completeRide', true);
      setErrorState('completeRide', null);

      const response = await ridesService.completeRide(rideId, user.telegram_id);

      if (response.success) {
        // Mise à jour optimiste
        setMyRides(prev =>
          prev.map(ride =>
            ride.id === rideId
              ? { ...ride, status: 'completed' }
              : ride
          )
        );
        toast.success('Course complétée avec succès');
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors de la complétion de la course');
      }
    } catch (error) {
      console.error('Erreur lors de la complétion de la course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorState('completeRide', errorMessage);
      toast.error('Impossible de compléter la course');
      return false;
    } finally {
      setLoadingState('completeRide', false);
    }
  };

  // Charger les données initiales quand l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      fetchMyRides();
      fetchAvailableRides();
      fetchSavedLocations();
    }
  }, [user]);

  // Configurer un abonnement Supabase pour écouter les changements
  useEffect(() => {
    if (!user) return;

    // Abonnement aux changements des courses
    const ridesChannel = supabase
      .channel('rides-changes')
      // Nouvelles courses disponibles
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rides',
        filter: `status=eq.pending`,
      }, () => {
        // Utilisation de React Query pour invalider le cache
        queryClient.invalidateQueries({ queryKey: ['availableRides'] });
      })
      // Courses assignées
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `status=eq.assigned`,
      }, (payload) => {
        const newData = payload.new as Ride;

        // Rafraîchir les listes si la course est assignée à l'utilisateur actuel
        if (newData.assigned_to === user.telegram_id.toString()) {
          toast.success('Une course vous a été assignée !');
          queryClient.invalidateQueries({ queryKey: ['myRides'] });
          fetchMyRides();
        }

        queryClient.invalidateQueries({ queryKey: ['availableRides'] });
        fetchAvailableRides();
      })
      // Modifications spécifiques aux courses avec intérêt
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
      }, (payload) => {
        const newData = payload.new as Ride;

        // Vérifier si cette course est dans notre liste d'intérêts
        if (interestedRides.includes(newData.id)) {
          // Notification si assignée à l'utilisateur
          if (newData.status === 'assigned' && newData.assigned_to === user.telegram_id.toString()) {
            toast.success('Une course pour laquelle vous avez montré de l\'intérêt vous a été assignée !');
            queryClient.invalidateQueries({ queryKey: ['myRides'] });
            fetchMyRides();
          }
        }
      })
      .subscribe();

    // Nettoyage lors du démontage du composant
    return () => {
      supabase.removeChannel(ridesChannel);
    };
  }, [user, interestedRides]);

  return (
    <RidesContext.Provider
      value={{
        myRides,
        availableRides,
        savedLocations,
        loading,
        errors,
        interestedRides,
        createRide,
        updateRide,
        fetchMyRides,
        fetchAvailableRides,
        fetchSavedLocations,
        showInterest,
        removeInterest,
        completeRide,
        clearErrors
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};

export const useRides = (): RidesContextType => {
  const context = useContext(RidesContext);
  if (context === undefined) {
    throw new Error('useRides must be used within a RidesProvider');
  }
  return context;
};