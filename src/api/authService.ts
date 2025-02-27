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
    // Si nous sommes en développement et que les données sont fictives,
    // simuler une réponse pour permettre le développement sans backend
    if (import.meta.env.DEV && telegramInitData === 'iframe-fallback-data') {
      console.log('Mode développement: Utilisation de données d\'authentification simulées');
      return {
        isRegistered: false,
        user: null,
        telegramUser: {
          id: Date.now(),
          first_name: "Utilisateur",
          last_name: "Test",
          username: `dev_user_${Date.now()}`,
          language_code: "fr",
          is_premium: false
        }
      };
    }
    
    return apiService.post<AuthResponse>('/api/auth/validate', { telegramInitData });
  },
  
  /**
   * Enregistre un nouvel utilisateur
   */
  registerUser: async (params: RegisterParams): Promise<ApiResponse<User>> => {
    // Si nous sommes en développement et que l'utilisateur a un ID basé sur timestamp (fictif),
    // simuler une réponse pour permettre le développement sans backend
    if (import.meta.env.DEV && typeof params.telegramUser.id === 'number' && 
        params.telegramUser.id > 1000000000000) { // Vérifier si c'est un timestamp récent
      console.log('Mode développement: Simulation d\'enregistrement utilisateur');
      const user: User = {
        id: params.telegramUser.id.toString(),
        telegram_id: params.telegramUser.id,
        first_name: params.telegramUser.first_name,
        last_name: params.telegramUser.last_name,
        username: params.telegramUser.username || '',
        phone_number: params.phone,
        email: params.email,
        address: params.address,
        created_at: new Date().toISOString()
      };
      
      return {
        success: true,
        data: user,
        message: 'Utilisateur enregistré avec succès (mode développement)'
      };
    }
    
    return apiService.post<ApiResponse<User>>('/api/users', params);
  }
};