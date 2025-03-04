// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '../types/app';
import { TelegramUser } from '../types/telegram';
import { useTelegram } from '../hooks/useTelegram';
import { authService } from '../api/authService';

interface AuthContextType {
    isLoading: boolean;
    isAuthenticated: boolean;
    isRegistered: boolean;
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
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const { user: telegramUser, initData, inTelegram } = useTelegram();

    const login = async (): Promise<void> => {
        try {
            console.log('[AuthContext] Tentative de login avec l\'utilisateur Telegram:', telegramUser);
            setIsLoading(true);

            try {
                // Essayer d'authentifier avec le backend
                console.log('[AuthContext] Appel du service validateAuth...');
                const response = await authService.validateAuth(telegramUser);
                console.log('[AuthContext] Réponse de validateAuth:', response);

                if (response.isRegistered && response.user) {
                    setUser(response.user);
                    setIsAuthenticated(true);
                    setIsRegistered(true);
                    console.log('[AuthContext] Utilisateur déjà enregistré:', response.user);
                } else {
                    setIsAuthenticated(false);
                    setIsRegistered(false);
                    console.log('[AuthContext] Utilisateur non enregistré, inscription requise');
                }
            } catch (error) {
                console.error('[AuthContext] Erreur lors de la validation avec le backend:', error);

                // En cas d'erreur avec le backend, si nous sommes en production et dans un iframe,
                // permettre à l'utilisateur de continuer avec une authentification simulée
                if (!import.meta.env.DEV && window !== window.parent) {
                    console.log('[AuthContext] Utilisation du mode de secours pour l\'authentification');
                    setIsAuthenticated(false);
                    setIsRegistered(false);
                } else {
                    throw error;
                }
            } finally {
                console.log('[AuthContext] Fin du processus de login, mise à jour de isLoading=false');
                setIsLoading(false);  // S'assurer que isLoading est mis à false dans tous les cas
            }
        } catch (error) {
            console.error('[AuthContext] Erreur d\'authentification:', error);
            setIsAuthenticated(false);
            setIsRegistered(false);
            setIsLoading(false);
        }
    };

    // Dans AuthContext.tsx
    useEffect(() => {
        console.log('%c[AuthContext] Initialisation du contexte d\'authentification', 'color: purple; font-weight: bold');
        // Utiliser une référence pour suivre si l'effet a déjà été exécuté

        const initAuth = async () => {
            console.log('[AuthContext] Démarrage du processus d\'authentification:', { 
                inTelegram, 
                telegramUserPresent: !!telegramUser,
                isLoading,
                isAuthenticated
            });
            
            if (inTelegram && telegramUser) {
                console.log('[AuthContext] Utilisateur Telegram disponible', telegramUser);

                // Ajouter un log pour mieux comprendre l'état
                console.log('[AuthContext] État d\'authentification:', { isAuthenticated, user });

                if (telegramUser || window !== window.parent) {
                    if (!isAuthenticated && !user) {
                        console.log('[AuthContext] Tentative de connexion automatique');
                        await login();
                        // Important: s'assurer que isLoading est mis à false même si login() échoue
                        console.log('[AuthContext] Processus de connexion terminé, mise à jour de isLoading=false');
                        setIsLoading(false);
                    } else {
                        console.log('[AuthContext] Déjà authentifié, mise à jour de isLoading=false');
                        setIsLoading(false);
                    }
                } else {
                    console.log('[AuthContext] Ni télégram ni iframe, mise à jour de isLoading=false');
                    setIsLoading(false);
                }
            } else {
                console.log('[AuthContext] Telegram non disponible:', { inTelegram, telegramUser });
                setIsLoading(false);
            }
        };

        // Exécuter initAuth et garantir que isLoading est défini à false après
        initAuth().finally(() => {
            console.log('[AuthContext] Fin du processus d\'initialisation, force isLoading=false');
            setIsLoading(false);
        });

    }, [inTelegram, telegramUser, isAuthenticated, user]);

    const registerUser = async (phoneNumber: string, email: string, address: string): Promise<User> => {
        try {
            // Si nous n'avons pas d'utilisateur Telegram mais que nous sommes dans un iframe,
            // créer un utilisateur Telegram fictif pour permettre l'inscription
            if (!telegramUser) {
                throw new Error('Utilisateur Telegram non disponible');
            }

            const response = await authService.registerUser({
                telegramUser,
                phone: phoneNumber,
                email,
                address
            });

            if (response.success && response.data) {
                setUser(response.data);
                setIsAuthenticated(true);
                setIsRegistered(true);
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
                isRegistered,
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