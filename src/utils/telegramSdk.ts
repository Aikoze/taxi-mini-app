// src/utils/telegramSdk.ts
import WebApp from '@twa-dev/sdk';

// Export the WebApp instance for direct use
export const twaDevWebApp = WebApp;

// Check if the app is running in Telegram environment
export const isInTelegram = (): boolean => {
  // Check URL parameters for development mode
  const urlParams = new URLSearchParams(window.location.search);
  const forceTelegram = urlParams.get('telegram') === 'true';

  // In development mode, consider we're in Telegram if forced via URL
  if (import.meta.env.DEV && forceTelegram) {
    console.log('Telegram mode forced via URL parameter in dev mode');
    return true;
  }

  // Check if we're in an iframe (typical for Telegram mini-apps)
  const isInIframe = window !== window.parent;

  // Check if the Telegram WebApp object is available
  const hasTelegramWebApp = Boolean(WebApp);

  // Log for debugging
  console.log('Telegram detection:', {
    isInIframe,
    hasTelegramWebApp,
    WebApp,
    isDev: import.meta.env.DEV
  });

  return hasTelegramWebApp || isInIframe;
};

// Initialize the Telegram WebApp
export const initTelegramApp = (): void => {
  try {
    if (WebApp) {
      console.log('Telegram WebApp SDK initialized successfully');
      // Note: WebApp.ready() is called in the App component
    } else {
      console.warn('Telegram WebApp SDK could not be initialized');
    }
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error);
  }
};

// Get Telegram user data
export const getTelegramUser = () => {
  try {
    // En mode développement, si l'utilisateur n'est pas disponible, créer un utilisateur fictif
    const user = WebApp.initDataUnsafe.user;

    if (!user && import.meta.env.DEV) {
      return {
        id: Date.now(),
        first_name: "Dev",
        last_name: "User",
        username: `dev_${Date.now()}`,
        language_code: "fr",
        is_premium: false
      };
    }

    return user;
  } catch (error) {
    console.error('Error getting Telegram user:', error);

    // En mode développement, retourner un utilisateur fictif en cas d'erreur
    if (import.meta.env.DEV) {
      console.log('Providing mock user after error in development mode');
      return {
        id: Date.now(),
        first_name: "Error",
        last_name: "Fallback",
        username: `error_${Date.now()}`,
        language_code: "fr",
        is_premium: false
      };
    }

    return null;
  }
};

// Get raw init data string
export const getTelegramInitData = (): string => {
  try {
    return WebApp.initData;
  } catch (error) {
    console.error('Error getting Telegram init data:', error);
    return '';
  }
};

// Main Button functions
export const setMainButtonVisible = (visible = true): void => {
  try {
    console.log('Setting MainButton visibility:', visible, 'WebApp.MainButton:', WebApp?.MainButton);
    if (visible) {
      WebApp.MainButton.show();
    } else {
      WebApp.MainButton.hide();
    }
  } catch (error) {
    console.error('Error setting main button visibility:', error);
  }
};

export const setMainButtonText = (text: string): void => {
  try {
    console.log('Setting MainButton text:', text, 'WebApp.MainButton:', WebApp?.MainButton);
    WebApp.MainButton.setText(text);
  } catch (error) {
    console.error('Error setting main button text:', error);
  }
};

export const setMainButtonLoading = (loading = true): void => {
  try {
    console.log('Setting MainButton loading:', loading, 'WebApp.MainButton:', WebApp?.MainButton);
    if (loading) {
      WebApp.MainButton.showProgress();
    } else {
      WebApp.MainButton.hideProgress();
    }
  } catch (error) {
    console.error('Error setting main button loading state:', error);
  }
};

export const onMainButtonClick = (callback: () => void): void => {
  try {
    console.log('Setting MainButton click handler', 'WebApp.MainButton:', WebApp?.MainButton);
    WebApp.MainButton.onClick(callback);
  } catch (error) {
    console.error('Error setting main button click handler:', error);
  }
};

// Close the WebApp
export const closeTelegramWebApp = (): void => {
  try {
    WebApp.close();
  } catch (error) {
    console.error('Error closing Telegram WebApp:', error);
  }
};

// Show alert via Telegram interface
export const showTelegramAlert = (message: string): void => {
  try {
    WebApp.showAlert(message);
  } catch (error) {
    console.error('Error showing Telegram alert:', error);
    // Fallback to browser alert
    alert(message);
  }
};

// Show confirmation dialog
export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    } catch (error) {
      console.error('Error showing Telegram confirmation:', error);
      // Fallback to browser confirm
      resolve(window.confirm(message));
    }
  });
};

// Get Telegram theme
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
  try {
    const { themeParams, colorScheme } = WebApp;

    return {
      colorScheme: colorScheme || 'light',
      backgroundColor: themeParams?.bg_color || '#ffffff',
      secondaryBackgroundColor: themeParams?.secondary_bg_color || '#f0f0f0',
      textColor: themeParams?.text_color || '#000000',
      buttonColor: themeParams?.button_color || '#2481cc',
      buttonTextColor: themeParams?.button_text_color || '#ffffff',
      hintColor: themeParams?.hint_color || '#999999',
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

// Export default for easy access
export default {
  isInTelegram,
  initTelegramApp,
  getTelegramUser,
  getTelegramInitData,
  setMainButtonVisible,
  setMainButtonText,
  setMainButtonLoading,
  onMainButtonClick,
  closeTelegramWebApp,
  showTelegramAlert,
  showTelegramConfirm,
  getTelegramTheme,
  requestLocation,
  WebApp,
};
