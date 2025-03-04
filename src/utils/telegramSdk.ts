// src/utils/telegramSdk.ts
import WebApp from '@twa-dev/sdk';

// Export the WebApp instance for direct use
export const twaDevWebApp = WebApp;

// Check if the app is running in Telegram environment
export const isInTelegram = (): boolean => {
  console.log('%c[telegramSdk] Vérification de l\'environnement Telegram', 'color: blue;');
  
  // Vérifier les variables globales
  const _window = window as any;
  const hasWindowTelegram = Boolean(_window.Telegram);
  console.log('[telegramSdk] - window.Telegram:', hasWindowTelegram ? 'présent' : 'absent');
  
  // Check URL parameters for development mode
  const urlParams = new URLSearchParams(window.location.search);
  const forceTelegram = urlParams.get('telegram') === 'true';
  console.log('[telegramSdk] - URL avec paramètre telegram=true:', forceTelegram ? 'OUI' : 'NON');

  // In development mode, consider we're in Telegram if forced via URL
  if (import.meta.env.DEV && forceTelegram) {
    console.log('[telegramSdk] Mode Telegram forcé via paramètre URL en mode développement');
    return true;
  }

  // Check if we're in an iframe (typical for Telegram mini-apps)
  const isInIframe = window !== window.parent;
  console.log('[telegramSdk] - Dans un iframe:', isInIframe ? 'OUI' : 'NON');

  // Check if the Telegram WebApp object is available
  const hasTelegramWebApp = Boolean(WebApp);
  console.log('[telegramSdk] - @twa-dev/sdk WebApp:', hasTelegramWebApp ? 'présent' : 'absent');
  
  // Tentative de détection supplémentaire par le User-Agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isTelegramUserAgent = userAgent.includes('telegram') || userAgent.includes('tgweb');
  console.log('[telegramSdk] - User-Agent Telegram:', isTelegramUserAgent ? 'DÉTECTÉ' : 'NON');

  // Recherche de pattern spécifique dans l'URL
  const url = window.location.href.toLowerCase();
  const hasTelegramPattern = url.includes('tg://') || url.includes('telegram.org') || url.includes('t.me/');
  console.log('[telegramSdk] - Pattern Telegram dans l\'URL:', hasTelegramPattern ? 'DÉTECTÉ' : 'NON');
  
  // Décision finale
  const result = hasWindowTelegram || hasTelegramWebApp || (isInIframe && (isTelegramUserAgent || hasTelegramPattern));
  console.log('[telegramSdk] Résultat final de la détection Telegram:', result ? 'DÉTECTÉ' : 'NON DÉTECTÉ');
  
  return result;
};

// Initialize the Telegram WebApp
export const initTelegramApp = (): void => {
  try {
    console.log('[telegramSdk] Tentative d\'initialisation du WebApp Telegram');
    
    if (WebApp) {
      // Inspecter les propriétés de l'objet WebApp
      const webAppProps = Object.keys(WebApp).filter(key => typeof key === 'string');
      console.log('[telegramSdk] Propriétés de WebApp:', webAppProps);
      
      // Vérifier si initData est disponible
      if (WebApp.initData) {
        console.log('[telegramSdk] initData est présent (longueur:', WebApp.initData.length, ')');
      } else {
        console.warn('[telegramSdk] initData est absent ou vide');
      }
      
      // Vérifier si initDataUnsafe est disponible
      if (WebApp.initDataUnsafe) {
        console.log('[telegramSdk] initDataUnsafe contient:', {
          auth_date: WebApp.initDataUnsafe.auth_date || 'absent',
          hash: WebApp.initDataUnsafe.hash ? 'présent' : 'absent',
          user: WebApp.initDataUnsafe.user ? 'présent' : 'absent'
        });
      } else {
        console.warn('[telegramSdk] initDataUnsafe est absent');
      }
      
      console.log('[telegramSdk] Telegram WebApp SDK initialisé avec succès');
      // Note: WebApp.ready() is called in the App component
    } else {
      console.warn('[telegramSdk] Telegram WebApp SDK n\'a pas pu être initialisé');
    }
  } catch (error) {
    console.error('[telegramSdk] Erreur lors de l\'initialisation du Telegram WebApp:', error);
  }
};

// Get Telegram user data
export const getTelegramUser = () => {
  try {
    // En mode développement, si l'utilisateur n'est pas disponible, créer un utilisateur fictif
    const user = WebApp.initDataUnsafe.user;

    if (!user && import.meta.env.DEV) {

      // if port = 5174, return a mock user
      if (window.location.port === '5174') {
        return {
          id: 893826723, // <- ID TELEGRAM
          first_name: "Youenn",
          last_name: "Toullec",
          username: `Youenn`,
          language_code: "fr",
          is_premium: false
        };
      }
      return {
        id: 1996239302, // <- ID TELEGRAM
        first_name: "Youenn",
        last_name: "Toullec",
        username: `Youenn`,
        language_code: "fr",
        is_premium: false
      };
    }

    return user;
  } catch (error) {
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
