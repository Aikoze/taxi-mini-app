import { TelegramEventNames, TelegramEventParams } from '../types/telegram';

export function setupTelegramMock() {
    if (window.Telegram) {
      console.log('Telegram API already available, skipping mock');
      return;
    }
  
    console.log('Setting up Telegram WebApp mock...');
  
    // Create mock Telegram object
    const mainButton = createMockMainButton();

    const backButton = {
      isVisible: false,
      show: function() {
        console.log('BackButton.show() called');
        this.isVisible = true;
      },
      hide: function() {
        console.log('BackButton.hide() called');
        this.isVisible = false;
      },
      onClick: function(callback) {
        console.log('BackButton.onClick() registered');
        document.addEventListener('mockBackButtonClick', callback);
      },
      offClick: function(callback) {
        console.log('BackButton.offClick() called');
        document.removeEventListener('mockBackButtonClick', callback);
      }
    };

    const hapticFeedback = {
      impactOccurred: function(style) {
        console.log('HapticFeedback.impactOccurred() called', { style });
        return this;
      },
      notificationOccurred: function(type) {
        console.log('HapticFeedback.notificationOccurred() called', { type });
        return this;
      },
      selectionChanged: function() {
        console.log('HapticFeedback.selectionChanged() called');
        return this;
      }
    };

    const cloudStorage = {
      setItem: function(key, value, callback) {
        console.log('CloudStorage.setItem() called', { key, value });
        localStorage.setItem(`tg_cloud_${key}`, value);
        if (callback) callback(null, true);
      },
      getItem: function(key, callback) {
        console.log('CloudStorage.getItem() called', { key });
        const value = localStorage.getItem(`tg_cloud_${key}`);
        if (callback) callback(null, value);
      },
      getItems: function(keys, callback) {
        console.log('CloudStorage.getItems() called', { keys });
        const result = {};
        keys.forEach(key => {
          result[key] = localStorage.getItem(`tg_cloud_${key}`);
        });
        if (callback) callback(null, result);
      },
      getKeys: function(callback) {
        console.log('CloudStorage.getKeys() called');
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('tg_cloud_')) {
            keys.push(key.substring(9));
          }
        }
        if (callback) callback(null, keys);
      },
      removeItem: function(key, callback) {
        console.log('CloudStorage.removeItem() called', { key });
        localStorage.removeItem(`tg_cloud_${key}`);
        if (callback) callback(null, true);
      },
      removeItems: function(keys, callback) {
        console.log('CloudStorage.removeItems() called', { keys });
        keys.forEach(key => {
          localStorage.removeItem(`tg_cloud_${key}`);
        });
        if (callback) callback(null, true);
      }
    };

    window.Telegram = {
      WebApp: {
        initData: "mock_init_data",
        initDataUnsafe: {
          query_id: "mock_query_id",
          user: {
            id: 123456789,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            language_code: "fr"
          },
          auth_date: Math.floor(Date.now() / 1000),
          hash: "mock_hash"
        },
        platform: "weba",
        colorScheme: "light",
        themeParams: {
          bg_color: "#ffffff" as `#${string}`,
          secondary_bg_color: "#f0f0f0" as `#${string}`,
          text_color: "#222222" as `#${string}`,
          hint_color: "#999999" as `#${string}`,
          link_color: "#2AABEE" as `#${string}`,
          button_color: "#2AABEE" as `#${string}`,
          button_text_color: "#ffffff" as `#${string}`,
        },
        isClosingConfirmationEnabled: false,
        headerColor: "#ffffff" as `#${string}`,
        backgroundColor: "#ffffff" as `#${string}`,
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        version: "6.0",
        
        // Main button
        MainButton: mainButton,
        
        // Back button
        BackButton: backButton,
        
        // Haptic feedback
        HapticFeedback: hapticFeedback,
        
        // Cloud storage
        CloudStorage: cloudStorage,
        
        // Methods
        ready: function() {
          console.log('Telegram WebApp.ready() called');
        },
        expand: function() {
          console.log('Telegram WebApp.expand() called');
        },
        close: function() {
          console.log('Telegram WebApp.close() called');
        },
        onEvent: function<T extends TelegramEventNames>(
          eventName: T,
          callback: (params: TelegramEventParams[T]) => unknown
        ) {
          console.log('Telegram WebApp.onEvent() called', { eventName });
          document.addEventListener(`mockTelegram${eventName}`, ((event: CustomEvent<TelegramEventParams[T]>) => {
            callback(event.detail);
          }) as EventListener);
        },
        offEvent: function<T extends TelegramEventNames>(
          eventName: T,
          callback: (params: TelegramEventParams[T]) => unknown
        ) {
          console.log('Telegram WebApp.offEvent() called', { eventName });
          document.removeEventListener(`mockTelegram${eventName}`, ((event: CustomEvent<TelegramEventParams[T]>) => {
            callback(event.detail);
          }) as EventListener);
        },
        sendData: function(data) {
          console.log('Telegram WebApp.sendData() called', { data });
        },
        openLink: function(link, options) {
          console.log('Telegram WebApp.openLink() called', { link, options });
          window.open(link, '_blank');
        },
        openTelegramLink: function(link) {
          console.log('Telegram WebApp.openTelegramLink() called', { link });
          window.open(`https://t.me/${link}`, '_blank');
        },
        isVersionAtLeast: function(version) {
          console.log('Telegram WebApp.isVersionAtLeast() called', { version });
          return true;
        },
        openInvoice: function(url, callback) {
          console.log('Telegram WebApp.openInvoice() called', { url });
          if (callback) setTimeout(() => callback('paid'), 1000);
        },
        setHeaderColor: function(color) {
          console.log('Telegram WebApp.setHeaderColor() called', { color });
          this.headerColor = color;
        },
        setBackgroundColor: function(color) {
          console.log('Telegram WebApp.setBackgroundColor() called', { color });
          this.backgroundColor = color;
        },
        showConfirm: function(message, callback) {
          console.log('Telegram WebApp.showConfirm() called', { message });
          const confirmed = window.confirm(message);
          if (callback) callback(confirmed);
        },
        showPopup: function(params, callback) {
          console.log('Telegram WebApp.showPopup() called', params);
          alert(params.message);
          if (callback) callback(params.buttons?.[0]?.id || null);
        },
        showAlert: function(message, callback) {
          console.log('Telegram WebApp.showAlert() called', { message });
          alert(message);
          if (callback) callback();
        },
        enableClosingConfirmation: function() {
          console.log('Telegram WebApp.enableClosingConfirmation() called');
          this.isClosingConfirmationEnabled = true;
        },
        disableClosingConfirmation: function() {
          console.log('Telegram WebApp.disableClosingConfirmation() called');
          this.isClosingConfirmationEnabled = false;
        },
        showScanQrPopup: function(params, callback) {
          console.log('Telegram WebApp.showScanQrPopup() called', params);
          setTimeout(() => {
            if (callback && callback('https://example.com') !== true) {
              this.closeScanQrPopup();
            }
          }, 3000);
        },
        closeScanQrPopup: function() {
          console.log('Telegram WebApp.closeScanQrPopup() called');
        },
        readTextFromClipboard: function(callback) {
          console.log('Telegram WebApp.readTextFromClipboard() called');
          if (callback) callback('Mock clipboard text');
        },
        switchInlineQuery: function(query, chooseChatTypes) {
          console.log('Telegram WebApp.switchInlineQuery() called', { query, chooseChatTypes });
        },
        requestWriteAccess: function(callback) {
          console.log('Telegram WebApp.requestWriteAccess() called');
          if (callback) callback(true);
        },
        requestContact: function(callback) {
          console.log('Telegram WebApp.requestContact() called');
          if (callback) callback(true);
        }
      }
    };
    
    // Add mock button to the UI for testing
    const mockButtonContainer = document.createElement('div');
    mockButtonContainer.style.position = 'fixed';
    mockButtonContainer.style.bottom = '80px';
    mockButtonContainer.style.left = '0';
    mockButtonContainer.style.right = '0';
    mockButtonContainer.style.display = 'flex';
    mockButtonContainer.style.justifyContent = 'center';
    mockButtonContainer.style.zIndex = '9999';
    
    const mockButton = document.createElement('button');
    mockButton.textContent = 'TRIGGER MAIN BUTTON';
    mockButton.style.padding = '10px 20px';
    mockButton.style.backgroundColor = '#2AABEE';
    mockButton.style.color = 'white';
    mockButton.style.border = 'none';
    mockButton.style.borderRadius = '8px';
    mockButton.style.cursor = 'pointer';
    
    mockButton.addEventListener('click', () => {
      const event = new Event('mockMainButtonClick');
      document.dispatchEvent(event);
    });
    
    mockButtonContainer.appendChild(mockButton);
    document.body.appendChild(mockButtonContainer);
    
    console.log('Telegram WebApp mock setup complete');
}

export const createMockMainButton = () => {
  let isVisible = false;
  let text = 'CONTINUE';
  let isActive = true;
  let isProgressVisible = false;
  let color: `#${string}` = '#2481cc';
  let textColor: `#${string}` = '#ffffff';
  let callback: (() => void) | null = null;

  console.log('Creating mock MainButton');

  // Stocker le callback dans une variable globale pour pouvoir le déclencher manuellement
  document.addEventListener('mockMainButtonClick', () => {
    console.log('Mock MainButton click event received');
    if (callback && isActive && isVisible) {
      console.log('Executing MainButton callback from event');
      callback();
    } else {
      console.log('Cannot execute callback: active=', isActive, 'visible=', isVisible, 'callback=', !!callback);
    }
  });

  return {
    text,
    color,
    textColor,
    isVisible,
    isActive,
    isProgressVisible,

    // Méthodes pour modifier les propriétés
    setText: (newText: string) => {
      console.log('Mock MainButton: setText', newText);
      text = newText;
      return this;
    },
    show: () => {
      console.log('Mock MainButton: show');
      isVisible = true;
      return this;
    },
    hide: () => {
      console.log('Mock MainButton: hide');
      isVisible = false;
      return this;
    },
    enable: () => {
      console.log('Mock MainButton: enable');
      isActive = true;
      return this;
    },
    disable: () => {
      console.log('Mock MainButton: disable');
      isActive = false;
      return this;
    },
    showProgress: (leaveActive = true) => {
      console.log('Mock MainButton: showProgress', leaveActive);
      isProgressVisible = true;
      isActive = leaveActive;
      return this;
    },
    hideProgress: () => {
      console.log('Mock MainButton: hideProgress');
      isProgressVisible = false;
      return this;
    },
    setParams: (params: any) => {
      console.log('Mock MainButton: setParams', params);
      if (params.text) text = params.text;
      if (params.color) color = params.color;
      if (params.text_color) textColor = params.text_color;
      if (params.is_active !== undefined) isActive = params.is_active;
      if (params.is_visible !== undefined) isVisible = params.is_visible;
      return this;
    },
    onClick: (cb: () => void) => {
      console.log('Mock MainButton: onClick - Setting callback');
      callback = cb;
      // Stocker le callback dans une variable globale pour pouvoir le déclencher manuellement
      (window as any).__mockMainButtonCallback = cb;
      return this;
    },
    offClick: () => {
      console.log('Mock MainButton: offClick - Removing callback');
      callback = null;
      (window as any).__mockMainButtonCallback = null;
      return this;
    },
  };
};