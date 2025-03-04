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
    getUserRides: async (userId: number | string, status?: string): Promise<Ride[]> => {
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
     * Met à jour une course existante
     */
    updateRide: async (rideId: number, rideData: any): Promise<ApiResponse<Ride>> => {
        return apiService.put<ApiResponse<Ride>>(`/api/rides/${rideId}`, rideData);
    },

    /**
     * Exprime un intérêt pour une course
     */
    showInterest: async (
        rideId: number,
        driverId: number | string,
        location: { latitude: number; longitude: number }
    ): Promise<ApiResponse<void>> => {
        return apiService.post<ApiResponse<void>>(`/api/rides/${rideId}/interest`, {
            driverId,
            location
        });
    },

    /**
     * Retire l'intérêt d'un chauffeur pour une course
     */
    removeInterest: async (
        rideId: number,
        driverId: number | string
    ): Promise<ApiResponse<void>> => {
        return apiService.delete<ApiResponse<void>>(`/api/rides/${rideId}/interest/${driverId}`);
    },

    /**
     * Marque une course comme terminée
     */
    completeRide: async (rideId: number, driverId: number | string): Promise<ApiResponse<void>> => {
        return apiService.post<ApiResponse<void>>(`/api/rides/${rideId}/complete`, {
            driverId
        });
    },

    /**
     * Récupère les détails d'attribution d'une course
     */
    getRideAssignment: async (rideId: number): Promise<any> => {
        return apiService.get<any>(`/api/rides/${rideId}/assignment`);
    },

    /**
     * Récupère les détails d'une course par son ID
     */
    getRideById: async (rideId: number | string): Promise<ApiResponse<Ride>> => {
        return apiService.get<ApiResponse<Ride>>(`/api/rides/${rideId}`);
    },

    /**
     * Assigne automatiquement une course lorsque son timer expire
     */
    autoAssignRide: async (rideId: number): Promise<ApiResponse<Ride>> => {
        return apiService.post<ApiResponse<Ride>>(`/api/rides/${rideId}/auto-assign`, {});
    }
};