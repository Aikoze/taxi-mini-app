// src/utils/telegram.ts
import { TelegramWebApp, TelegramUser } from '../types/telegram';

// Référence à l'objet global Telegram
const telegram: TelegramWebApp | undefined = window.Telegram?.WebApp;

// Vérifie si l'application est exécutée dans l'environnement Telegram
export const isInTelegram = (): boolean => {
    return !!telegram;
};

// Initialise l'application et configure les paramètres requis par Telegram
export const initTelegramApp = (): boolean => {
    if (!isInTelegram()) {
        console.warn('L\'application n\'est pas exécutée dans Telegram.');
        return false;
    }

    // Expansion à la hauteur maximale
    telegram.expand();

    // Activation du bouton principal si besoin
    if (telegram.MainButton) {
        telegram.MainButton.setParams({
            text: 'Continuer',
            color: '#2AABEE',
            text_color: '#ffffff',
            is_visible: false
        });
    }

    // Notification à Telegram que l'application est prête
    telegram.ready();

    return true;
};

// Obtenir les données utilisateur de Telegram
export const getTelegramUser = (): TelegramUser | null => {
    if (!isInTelegram()) {
        return null;
    }
    return telegram.initDataUnsafe?.user || null;
};

// Obtenir la chaîne de données d'initialisation complète
export const getTelegramInitData = (): string | null => {
    if (!isInTelegram()) {
        return null;
    }
    return telegram.initData || null;
};

// Gestion du bouton principal
export const setMainButtonVisible = (visible = true): void => {
    if (!isInTelegram() || !telegram.MainButton) {
        return;
    }

    if (visible) {
        telegram.MainButton.show();
    } else {
        telegram.MainButton.hide();
    }
};

export const setMainButtonText = (text: string): void => {
    if (!isInTelegram() || !telegram.MainButton) {
        return;
    }

    telegram.MainButton.setText(text);
};

export const setMainButtonLoading = (loading = true): void => {
    if (!isInTelegram() || !telegram.MainButton) {
        return;
    }

    if (loading) {
        telegram.MainButton.showProgress();
    } else {
        telegram.MainButton.hideProgress();
    }
};

export const onMainButtonClick = (callback: () => void): void => {
    if (!isInTelegram() || !telegram.MainButton) {
        return;
    }

    telegram.MainButton.onClick(callback);
};

// Fermer l'application Web
export const closeTelegramWebApp = (): void => {
    if (!isInTelegram()) {
        return;
    }

    telegram.close();
};

// Ouvrir le mode de sélection de localisation
export const requestLocation = async (): Promise<{ latitude: number, longitude: number } | null> => {
    if (!isInTelegram()) {
        return null;
    }

    try {
        // Vérifier si la géolocalisation est disponible
        if (!telegram.geolocation) {
            throw new Error('Géolocalisation non supportée dans cette version de Telegram');
        }

        // Demander la position
        return new Promise((resolve, reject) => {
            telegram.geolocation?.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {
                    reject(error);
                },
                { enableHighAccuracy: true }
            );
        });
    } catch (error) {
        console.error('Erreur lors de la demande de localisation:', error);
        return null;
    }
};

// Afficher une alerte via l'interface Telegram
export const showTelegramAlert = (message: string): void => {
    if (!isInTelegram()) {
        alert(message);
        return;
    }

    telegram.showAlert(message);
};

// Afficher une popup de confirmation
export const showTelegramConfirm = (message: string): Promise<boolean> => {
    if (!isInTelegram()) {
        return Promise.resolve(confirm(message));
    }

    return new Promise((resolve) => {
        telegram.showConfirm(message, (confirmed) => {
            resolve(confirmed);
        });
    });
};

// Obtenir le thème Telegram
export interface TelegramTheme {
    colorScheme: 'light' | 'dark';
    backgroundColor: string;
    secondaryBackgroundColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    hintColor: string;
}

export const getTelegramTheme = (): TelegramTheme => {
    if (!isInTelegram()) {
        return {
            colorScheme: 'light',
            backgroundColor: '#ffffff',
            secondaryBackgroundColor: '#f5f5f5',
            textColor: '#222222',
            buttonColor: '#2AABEE',
            buttonTextColor: '#ffffff',
            hintColor: '#999999'
        };
    }

    return {
        colorScheme: telegram.colorScheme || 'light',
        backgroundColor: telegram.backgroundColor || '#ffffff',
        secondaryBackgroundColor: telegram.secondaryBackgroundColor || '#f5f5f5',
        textColor: telegram.textColor || '#222222',
        buttonColor: telegram.buttonColor || '#2AABEE',
        buttonTextColor: telegram.buttonTextColor || '#ffffff',
        hintColor: telegram.hintColor || '#999999'
    };
};

// Export de l'objet Telegram WebApp pour un accès direct
export default telegram;