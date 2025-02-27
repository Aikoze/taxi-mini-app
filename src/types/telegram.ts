// src/types/telegram.ts
export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      query_id: string;
      user: TelegramUser;
      auth_date: string;
      hash: string;
    };
    colorScheme: 'light' | 'dark';
    backgroundColor: string;
    textColor: string;
    secondaryBackgroundColor: string;
    buttonColor: string;
    buttonTextColor: string;
    hintColor: string;
    
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    
    expand: () => void;
    close: () => void;
    
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      isProgressVisible: boolean;
      setText: (text: string) => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
      show: () => void;
      hide: () => void;
      enable: () => void;
      disable: () => void;
      showProgress: () => void;
      hideProgress: () => void;
      setParams: (params: {
        text?: string;
        color?: string;
        text_color?: string;
        is_active?: boolean;
        is_visible?: boolean;
      }) => void;
    };
    
    BackButton: {
      isVisible: boolean;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
    };
    
    ready: () => void;
    showAlert: (message: string) => void;
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
    
    geolocation?: {
      getCurrentPosition: (
        success: PositionCallback,
        error: PositionErrorCallback,
        options?: PositionOptions
      ) => void;
    };
    
    sendData: (data: string) => void;
    onEvent: (eventType: string, callback: () => void) => void;
    offEvent: (eventType: string, callback: () => void) => void;
  }
  
  export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  }
  
  declare global {
    interface Window {
      Telegram?: {
        WebApp: TelegramWebApp;
      };
    }
  }