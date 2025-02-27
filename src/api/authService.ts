// src/api/authService.ts
import { apiService } from './apiService';
import { User, ApiResponse } from '../types/app';
import { TelegramUser } from '../types/telegram';

interface AuthResponse {
  isRegistered: boolean;
  user: User | null;
  telegramUser: TelegramUser;
}

interface RegisterParams {
  telegramUser: TelegramUser;
  phone: string;
  email: string;
  address: string;
}

/**
 * Service pour gérer l'authentification
 */
export const authService = {
  /**
   * Valide les données d'authentification Telegram
   */
  validateAuth: async (telegramInitData: string): Promise<AuthResponse> => {
    return apiService.post<AuthResponse>('/api/auth/validate', { telegramInitData });
  },
  
  /**
   * Enregistre un nouvel utilisateur
   */
  registerUser: async (params: RegisterParams): Promise<ApiResponse<User>> => {
    return apiService.post<ApiResponse<User>>('/api/users', params);
  }
};