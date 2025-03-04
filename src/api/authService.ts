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

  validateAuth: async (telegramUser: TelegramUser): Promise<AuthResponse> => {
    console.log('Envoi de la demande de validation avec ID:', telegramUser.id);
    return apiService.post<AuthResponse>('/api/auth/validate', { id: telegramUser.id });
  },

  /**
   * Enregistre un nouvel utilisateur
   */
  registerUser: async (params: RegisterParams): Promise<ApiResponse<User>> => {
    return apiService.post<ApiResponse<User>>('/api/users', params);
  }
};