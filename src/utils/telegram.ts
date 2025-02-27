// src/utils/telegram.ts
import { TelegramWebApp, TelegramUser } from '../types/telegram';

// Référence à l'objet global Telegram
const telegram: TelegramWebApp | undefined = window.Telegram?.WebApp;

// Vérifie si l'application est exécutée dans l'environnement Telegram
// Modification de isInTelegram()
export const isInTelegram = (): boolean => {
    // Vérifier le paramètre d'URL pour le dev
    const urlParams = new URLSearchParams(window.location.search);
    const forceTelegram = urlParams.get('telegram') === 'true';

    if (import.meta.env.DEV) {
        return true;
      }
      
    if (forceTelegram) {
        console.log('Mode Telegram forcé par paramètre URL');
        return true;
    }

    return !!window.Telegram?.WebApp;
};
// Initialise l'application et configure les paramètres requis par Telegram
export const initTelegramApp = (): boolean => {
    if (!isInTelegram()) {
        console.warn('L\'application n\'est pas exécutée dans Telegram.');
        return false;
    }

    // Expansion à la hauteur maximale
    window.Telegram?.WebApp?.expand();

    // Activation du bouton principal si besoin
    if (window.Telegram?.WebApp?.MainButton) {
        window.Telegram.WebApp.MainButton.setParams({
            text: 'Continuer',
            color: '#2AABEE',
            text_color: '#ffffff',
            is_visible: false
        });
    }

    // Notification à Telegram que l'application est prête
    window.Telegram?.WebApp?.ready();

    return true;
};

// Obtenir les données utilisateur de Telegram
export const getTelegramUser = (): TelegramUser | null => {
    if (!isInTelegram() || !window.Telegram?.WebApp) {
        return null;
    }
    return window.Telegram.WebApp.initDataUnsafe?.user || null;
};

// Obtenir la chaîne de données d'initialisation complète
export const getTelegramInitData = (): string | null => {
    if (!isInTelegram() || !window.Telegram?.WebApp) {
        return null;
    }
    return window.Telegram.WebApp.initData || null;
};

// Gestion du bouton principal
export const setMainButtonVisible = (visible = true): void => {
    if (!isInTelegram() || !window.Telegram?.WebApp?.MainButton) {
        return;
    }

    if (visible) {
        window.Telegram.WebApp.MainButton.show();
    } else {
        window.Telegram.WebApp.MainButton.hide();
    }
};

export const setMainButtonText = (text: string): void => {
    if (!isInTelegram() || !window.Telegram?.WebApp?.MainButton) {
        return;
    }

    window.Telegram.WebApp.MainButton.setText(text);
};

export const setMainButtonLoading = (loading = true): void => {
    if (!isInTelegram() || !window.Telegram?.WebApp?.MainButton) {
        return;
    }

    if (loading) {
        window.Telegram.WebApp.MainButton.showProgress();
    } else {
        window.Telegram.WebApp.MainButton.hideProgress();
    }
};

export const onMainButtonClick = (callback: () => void): void => {
    if (!isInTelegram() || !window.Telegram?.WebApp?.MainButton) {
        return;
    }

    window.Telegram.WebApp.MainButton.onClick(callback);
};

// Fermer l'application Web
export const closeTelegramWebApp = (): void => {
    if (!isInTelegram()) {
        return;
    }

    window.Telegram?.WebApp?.close();
};

// Ouvrir le mode de sélection de localisation
export const requestLocation = async (): Promise<{ latitude: number, longitude: number } | null> => {
    if (!isInTelegram()) {
        return null;
    }

    try {
        // Vérifier si la géolocalisation est disponible
        if (!window.Telegram?.WebApp?.geolocation) {
            throw new Error('Géolocalisation non supportée dans cette version de Telegram');
        }

        // Demander la position
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.geolocation?.getCurrentPosition(
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

    window.Telegram?.WebApp?.showAlert(message);
};

// Afficher une popup de confirmation
export const showTelegramConfirm = (message: string): Promise<boolean> => {
    if (!isInTelegram()) {
        return Promise.resolve(confirm(message));
    }

    return new Promise((resolve) => {
        window.Telegram.WebApp.showConfirm(message, (confirmed) => {
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
        colorScheme: window.Telegram.WebApp.colorScheme || 'light',
        backgroundColor: window.Telegram.WebApp.backgroundColor || '#ffffff',
        secondaryBackgroundColor: window.Telegram.WebApp.secondaryBackgroundColor || '#f5f5f5',
        textColor: window.Telegram.WebApp.textColor || '#222222',
        buttonColor: window.Telegram.WebApp.buttonColor || '#2AABEE',
        buttonTextColor: window.Telegram.WebApp.buttonTextColor || '#ffffff',
        hintColor: window.Telegram.WebApp.hintColor || '#999999'
    };
};

// Export de l'objet Telegram WebApp pour un accès direct
export default window.Telegram?.WebApp;