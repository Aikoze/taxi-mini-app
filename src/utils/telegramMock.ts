// src/utils/telegramMock.ts
export function setupTelegramMock() {
    if (window.Telegram) {
      console.log('Telegram API already available, skipping mock');
      return;
    }
  
    console.log('Setting up Telegram WebApp mock...');
  
    // Create mock Telegram object
    const mainButton = {
      isActive: true,
      isVisible: false,
      isProgressVisible: false,
      text: "CONTINUE",
      color: "#2AABEE",
      textColor: "#ffffff",
      show: function() {
        console.log('MainButton.show() called');
        this.isVisible = true;
      },
      hide: function() {
        console.log('MainButton.hide() called');
        this.isVisible = false;
      },
      enable: function() {
        console.log('MainButton.enable() called');
        this.isActive = true;
      },
      disable: function() {
        console.log('MainButton.disable() called');
        this.isActive = false;
      },
      showProgress: function(leaveActive) {
        console.log('MainButton.showProgress() called', { leaveActive });
        this.isProgressVisible = true;
      },
      hideProgress: function() {
        console.log('MainButton.hideProgress() called');
        this.isProgressVisible = false;
      },
      setText: function(text) {
        console.log('MainButton.setText() called', { text });
        this.text = text;
      },
      onClick: function(callback) {
        console.log('MainButton.onClick() registered');
        document.addEventListener('mockMainButtonClick', callback);
      },
      offClick: function(callback) {
        console.log('MainButton.offClick() called');
        document.removeEventListener('mockMainButtonClick', callback);
      },
      setParams: function(params) {
        console.log('MainButton.setParams() called', params);
        if (params.color) this.color = params.color;
        if (params.text) this.text = params.text;
        if (params.text_color) this.textColor = params.text_color;
        if (params.is_active !== undefined) this.isActive = params.is_active;
        if (params.is_visible !== undefined) this.isVisible = params.is_visible;
      }
    };

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
          bg_color: "#ffffff",
          secondary_bg_color: "#f0f0f0",
          text_color: "#222222",
          hint_color: "#999999",
          link_color: "#2AABEE",
          button_color: "#2AABEE",
          button_text_color: "#ffffff",
        },
        isClosingConfirmationEnabled: false,
        headerColor: "#ffffff",
        backgroundColor: "#ffffff",
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
        onEvent: function(eventName, callback) {
          console.log('Telegram WebApp.onEvent() called', { eventName });
          document.addEventListener(`mockTelegram${eventName}`, callback);
        },
        offEvent: function(eventName, callback) {
          console.log('Telegram WebApp.offEvent() called', { eventName });
          document.removeEventListener(`mockTelegram${eventName}`, callback);
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