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
        if (inTelegram && telegramUser && initData) {
            login();
        } else {
            setIsLoading(false);
        }
    }, [inTelegram, telegramUser, initData]);

    const login = async (): Promise<void> => {
        try {
            setIsLoading(true);

            if (!initData) {
                throw new Error('Données d\'initialisation Telegram manquantes');
            }

            const response = await authService.validateAuth(initData);

            if (response.isRegistered && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
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
                return response.data;
            } else {
                throw new Error(response.error || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
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