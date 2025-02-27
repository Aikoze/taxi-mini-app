// src/api/ridesService.ts
import { apiService } from './apiService';
import { Ride, CreateRideData, ApiResponse, SavedLocation } from '../types/app';

/**
 * Service pour gérer les courses
 */
export const ridesService = {
    /**
     * Récupère les courses d'un utilisateur
     */
    getUserRides: async (userId: string, status?: string): Promise<Ride[]> => {
        const endpoint = `/api/users/${userId}/rides${status ? `?status=${status}` : ''}`;
        return apiService.get<Ride[]>(endpoint);
    },

    /**
     * Récupère les courses disponibles
     */
    getAvailableRides: async (): Promise<Ride[]> => {
        return apiService.get<Ride[]>('/api/rides/available');
    },

    /**
     * Crée une nouvelle course
     */
    createRide: async (rideData: CreateRideData): Promise<ApiResponse<Ride>> => {
        return apiService.post<ApiResponse<Ride>>('/api/rides', rideData);
    },

    /**
     * Exprime un intérêt pour une course
     */
    showInterest: async (
        rideId: number,
        driverId: string,
        location: { latitude: number; longitude: number }
    ): Promise<ApiResponse<void>> => {
        return apiService.post<ApiResponse<void>>(`/api/rides/${rideId}/interest`, {
            driverId,
            location
        });
    },

    /**
     * Marque une course comme terminée
     */
    completeRide: async (rideId: number, driverId: string): Promise<ApiResponse<void>> => {
        return apiService.post<ApiResponse<void>>(`/api/rides/${rideId}/complete`, {
            driverId
        });
    }
};