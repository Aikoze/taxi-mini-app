// src/api/statsService.ts
import { apiService } from './apiService';
import { ApiResponse } from '../types/app';

/**
 * Types pour les statistiques
 */
export interface GroupStats {
  total_rides: number;
  pending_rides: number;
  assigned_rides: number;
  completed_rides: number;
  cancelled_rides: number;
}

export interface UserStats {
  created_rides: number;
  assigned_rides: number;
}

export interface DailyStats {
  total_rides_today: number;
  assigned_rides_today: number;
}

/**
 * Service pour gérer les statistiques
 */
export const statsService = {
  /**
   * Récupère les statistiques globales du groupe
   */
  getGroupStats: async (): Promise<ApiResponse<GroupStats>> => {
    return apiService.get<ApiResponse<GroupStats>>('/api/stats/group');
  },

  /**
   * Récupère les statistiques d'un utilisateur
   */
  getUserStats: async (userId: number | string): Promise<ApiResponse<UserStats>> => {
    return apiService.get<ApiResponse<UserStats>>(`/api/users/${userId}/stats`);
  },

  /**
   * Récupère les statistiques du jour
   */
  getDailyStats: async (): Promise<ApiResponse<DailyStats>> => {
    return apiService.get<ApiResponse<DailyStats>>('/api/stats/daily');
  }
};
