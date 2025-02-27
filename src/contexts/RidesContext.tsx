// src/contexts/RidesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ride, SavedLocation } from '../types/app';
import { useAuth } from './AuthContext';
import { ridesService } from '../api/ridesService';
import { locationsService } from '../api/locationService';

interface RidesContextType {
  myRides: Ride[];
  availableRides: Ride[];
  savedLocations: SavedLocation[];
  isLoading: boolean;
  createRide: (rideData: any) => Promise<Ride>;
  fetchMyRides: () => Promise<void>;
  fetchAvailableRides: () => Promise<void>;
  fetchSavedLocations: (category?: string) => Promise<SavedLocation[]>;
  showInterest: (rideId: number, location: { latitude: number; longitude: number }) => Promise<boolean>;
  completeRide: (rideId: number) => Promise<boolean>;
}

const RidesContext = createContext<RidesContextType | undefined>(undefined);

interface RidesProviderProps {
  children: ReactNode;
}

export const RidesProvider: React.FC<RidesProviderProps> = ({ children }) => {
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchMyRides = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);

      const rides = await ridesService.getUserRides(user.telegram_id);
      setMyRides(rides);

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      setIsLoading(false);
    }
  };

  const fetchAvailableRides = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);

      const rides = await ridesService.getAvailableRides();
      setAvailableRides(rides);

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses disponibles:', error);
      setIsLoading(false);
    }
  };

  const fetchSavedLocations = async (category?: string): Promise<SavedLocation[]> => {
    try {
      setIsLoading(true);

      const locations = await locationsService.getLocations()
      setSavedLocations(locations);

      setIsLoading(false);
      return locations;
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      setIsLoading(false);
      return [];
    }
  };

  const createRide = async (rideData: any): Promise<Ride> => {
    try {
      setIsLoading(true);

      const response = await ridesService.createRide({
        ...rideData,
        userId: user?.telegram_id
      });

      if (response.success && response.data) {
        setMyRides(prevRides => [...prevRides, response.data]);
        setIsLoading(false);
        return response.data;
      } else {
        throw new Error(response.error || 'Erreur lors de la création de la course');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la course:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const showInterest = async (rideId: number, location: { latitude: number; longitude: number }): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);

      const response = await ridesService.showInterest(rideId, user.telegram_id, location);

      setIsLoading(false);
      return response.success || false;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'intérêt:', error);
      setIsLoading(false);
      return false;
    }
  };

  const completeRide = async (rideId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);

      const response = await ridesService.completeRide(rideId, user.telegram_id);

      if (response.success) {
        await fetchMyRides();
      }

      setIsLoading(false);
      return response.success || false;
    } catch (error) {
      console.error('Erreur lors de la complétion de la course:', error);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyRides();
      fetchAvailableRides();
      fetchSavedLocations();
    }
  }, [user]);

  return (
    <RidesContext.Provider
      value={{
        myRides,
        availableRides,
        savedLocations,
        isLoading,
        createRide,
        fetchMyRides,
        fetchAvailableRides,
        fetchSavedLocations,
        showInterest,
        completeRide
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