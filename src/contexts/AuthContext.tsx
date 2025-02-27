// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/app';
import { TelegramUser } from '../types/telegram';
import { useTelegram } from '../hooks/useTelegram';
import { authService } from '../api/authService';

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: User | null;
    telegramUser: TelegramUser | null;
    login: () => Promise<void>;
    registerUser: (phoneNumber: string, email: string, address: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const { user: telegramUser, initData, inTelegram } = useTelegram();

    useEffect(() => {
        if (inTelegram && telegramUser) {
            // Vérifier si nous avons des données d'initialisation ou si nous sommes dans un iframe
            if (initData || window !== window.parent) {
                login();
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [inTelegram, telegramUser, initData]);

    const login = async (): Promise<void> => {
        try {
            setIsLoading(true);

            // Si nous n'avons pas de données d'initialisation mais que nous sommes dans un iframe,
            // créer des données fictives pour permettre à l'application de fonctionner
            const dataToUse = initData || (window !== window.parent ? 'iframe-fallback-data' : null);

            if (!dataToUse) {
                throw new Error('Données d\'initialisation Telegram manquantes');
            }

            try {
                // Essayer d'authentifier avec le backend
                const response = await authService.validateAuth(dataToUse);

                if (response.isRegistered && response.user) {
                    setUser(response.user);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Erreur lors de la validation avec le backend:', error);
                
                // En cas d'erreur avec le backend, si nous sommes en production et dans un iframe,
                // permettre à l'utilisateur de continuer avec une authentification simulée
                if (!import.meta.env.DEV && window !== window.parent) {
                    console.log('Utilisation du mode de secours pour l\'authentification');
                    setIsAuthenticated(false);
                } else {
                    throw error;
                }
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const registerUser = async (phoneNumber: string, email: string, address: string): Promise<User> => {
        try {
            // Si nous n'avons pas d'utilisateur Telegram mais que nous sommes dans un iframe,
            // créer un utilisateur Telegram fictif pour permettre l'inscription
            const userToUse = telegramUser || (window !== window.parent ? {
                id: Date.now(), // Utiliser un ID basé sur le timestamp
                first_name: "Utilisateur",
                last_name: "Telegram",
                username: `user_${Date.now()}`,
                language_code: "fr",
                is_premium: false
            } : null);

            if (!userToUse) {
                throw new Error('Utilisateur Telegram non disponible');
            }

            const response = await authService.registerUser({
                telegramUser: userToUse,
                phone: phoneNumber,
                email,
                address
            });

            if (response.success && response.data) {
                setUser(response.data);
                setIsAuthenticated(true);
                return response.data;
            } else {
                throw new Error(response.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                isAuthenticated,
                user,
                telegramUser,
                login,
                registerUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};