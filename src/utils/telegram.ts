// src/utils/telegram.ts
import { TelegramWebApp, TelegramUser, TelegramTheme } from '../types/telegram';

// Reference to the global Telegram object
const telegram: TelegramWebApp | undefined = window.Telegram?.WebApp;

// Check if the application is running in the Telegram environment
export const isInTelegram = (): boolean => {
    // Check URL parameter for dev mode
    const urlParams = new URLSearchParams(window.location.search);
    const forceTelegram = urlParams.get('telegram') === 'true';
    
    // Check if we're in an iframe (typical for Telegram mini-apps)
    const isInIframe = window !== window.parent;
    
    // Check if the Telegram object is available
    const hasTelegramObject = !!window.Telegram?.WebApp;
    
    // Check if the URL contains Telegram-specific parameters
    const hasInitData = window.location.hash.includes('tgWebAppData') || 
                        window.location.search.includes('tgWebAppData');
    
    
    // In development mode, consider we're in Telegram if forced via URL
    if (import.meta.env.DEV && forceTelegram) {
        console.log('Telegram mode forced via URL parameter in dev mode');
        return true;
    }
    
    return hasTelegramObject || (isInIframe && hasInitData);
};

// Initialize the Telegram application and configure required parameters
export const initTelegramApp = (): boolean => {
    try {
        if (telegram) {
            console.log('Initializing Telegram WebApp');
            
            // Call ready() to inform Telegram that the WebApp is ready
            telegram.ready();
            
            // Configure the main button if needed
            // telegram.MainButton.setText('CONTINUE');
            // telegram.MainButton.show();
            
            console.log('Telegram WebApp initialized successfully');
            return true;
        } else {
            console.warn('Telegram WebApp not available');
            return false;
        }
    } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        return false;
    }
};

// Get Telegram user data
export const getTelegramUser = (): TelegramUser | null => {
    try {
        if (telegram && telegram.initDataUnsafe.user) {
            return telegram.initDataUnsafe.user;
        }
        return null;
    } catch (error) {
        console.error('Error getting Telegram user:', error);
        return null;
    }
};

// Get raw init data string
export const getTelegramInitData = (): string | null => {
    try {
        if (telegram) {
            return telegram.initData;
        }
        return null;
    } catch (error) {
        console.error('Error getting Telegram init data:', error);
        return null;
    }
};

// Main Button functions
export const setMainButtonVisible = (visible = true): void => {
    try {
        if (telegram?.MainButton) {
            if (visible) {
                telegram.MainButton.show();
            } else {
                telegram.MainButton.hide();
            }
        }
    } catch (error) {
        console.error('Error setting main button visibility:', error);
    }
};

export const setMainButtonText = (text: string): void => {
    try {
        if (telegram?.MainButton) {
            telegram.MainButton.setText(text);
        }
    } catch (error) {
        console.error('Error setting main button text:', error);
    }
};

export const setMainButtonLoading = (loading = true): void => {
    try {
        if (telegram?.MainButton) {
            if (loading) {
                telegram.MainButton.showProgress();
            } else {
                telegram.MainButton.hideProgress();
            }
        }
    } catch (error) {
        console.error('Error setting main button loading state:', error);
    }
};

export const onMainButtonClick = (callback: () => void): void => {
    try {
        if (telegram?.MainButton) {
            telegram.MainButton.onClick(callback);
        }
    } catch (error) {
        console.error('Error setting main button click handler:', error);
    }
};

// Close the WebApp
export const closeTelegramWebApp = (): void => {
    try {
        if (telegram) {
            telegram.close();
        }
    } catch (error) {
        console.error('Error closing Telegram WebApp:', error);
    }
};

// Request location
export const requestLocation = (): Promise<{ latitude: number, longitude: number } | null> => {
    return new Promise((resolve) => {
        try {
            // Note: Telegram WebApp doesn't have a direct method to request location
            // This is a workaround using geolocation API
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    () => {
                        console.warn('Geolocation permission denied');
                        resolve(null);
                    }
                );
            } else {
                console.warn('Geolocation is not supported by this browser');
                resolve(null);
            }
        } catch (error) {
            console.error('Error requesting location:', error);
            resolve(null);
        }
    });
};

// Show alert via Telegram interface
export const showTelegramAlert = (message: string): void => {
    try {
        if (telegram) {
            telegram.showAlert(message);
        } else {
            // Fallback to browser alert
            alert(message);
        }
    } catch (error) {
        console.error('Error showing Telegram alert:', error);
        alert(message);
    }
};

// Show confirmation dialog
export const showTelegramConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
        try {
            if (telegram) {
                telegram.showConfirm(message, (confirmed) => {
                    resolve(confirmed);
                });
            } else {
                // Fallback to browser confirm
                resolve(window.confirm(message));
            }
        } catch (error) {
            console.error('Error showing Telegram confirmation:', error);
            resolve(window.confirm(message));
        }
    });
};

// Get Telegram theme
export const getTelegramTheme = (): TelegramTheme => {
    try {
        if (telegram) {
            const { themeParams, colorScheme } = telegram;
            
            return {
                colorScheme: colorScheme || 'light',
                backgroundColor: themeParams?.bg_color || '#ffffff',
                secondaryBackgroundColor: themeParams?.secondary_bg_color || '#f0f0f0',
                textColor: themeParams?.text_color || '#000000',
                buttonColor: themeParams?.button_color || '#2481cc',
                buttonTextColor: themeParams?.button_text_color || '#ffffff',
                hintColor: themeParams?.hint_color || '#999999',
            };
        }
        
        // Return default light theme if Telegram is not available
        return {
            colorScheme: 'light',
            backgroundColor: '#ffffff',
            secondaryBackgroundColor: '#f0f0f0',
            textColor: '#000000',
            buttonColor: '#2481cc',
            buttonTextColor: '#ffffff',
            hintColor: '#999999',
        };
    } catch (error) {
        console.error('Error getting Telegram theme:', error);
        // Return default light theme
        return {
            colorScheme: 'light',
            backgroundColor: '#ffffff',
            secondaryBackgroundColor: '#f0f0f0',
            textColor: '#000000',
            buttonColor: '#2481cc',
            buttonTextColor: '#ffffff',
            hintColor: '#999999',
        };
    }
};

// Export the Telegram WebApp object for direct access
export default window.Telegram?.WebApp;