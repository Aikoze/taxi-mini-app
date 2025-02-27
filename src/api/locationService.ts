// src/api/locationsService.ts
import { apiService } from './apiService';
import { SavedLocation } from '../types/app';
/**
 * Service pour gérer les lieux préenregistrés
 */
export const locationsService = {
  /**
   * Récupère les lieux préenregistrés
   */
  getLocations: async (category?: string): Promise<SavedLocation[]> => {
    const endpoint = `/api/locations${category ? `?category=${category}` : ''}`;
    return apiService.get<SavedLocation[]>(endpoint);
  }
};