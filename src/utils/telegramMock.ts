// src/utils/telegramMock.ts
export function setupTelegramMock() {
    if (window.Telegram) {
      console.log('Telegram API déjà disponible, skip mock');
      return;
    }
  
    console.log('Configuration du mock Telegram WebApp...');
  
    // Créer l'objet Telegram mock
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
          auth_date: Date.now().toString(),
          hash: "mock_hash"
        },
        colorScheme: "light",
        backgroundColor: "#ffffff",
        textColor: "#222222",
        secondaryBackgroundColor: "#f5f5f5",
        buttonColor: "#2AABEE",
        buttonTextColor: "#ffffff",
        hintColor: "#999999",
        
        isExpanded: false,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        
        expand: function() {
          this.isExpanded = true;
          console.log("WebApp expanded");
        },
        close: function() {
          console.log("WebApp closed");
        },
        
        MainButton: {
          text: "Continuer",
          color: "#2AABEE",
          textColor: "#ffffff",
          isVisible: false,
          isActive: true,
          isProgressVisible: false,
          setText: function(text) {
            this.text = text;
            console.log("Main button text set to:", text);
          },
          onClick: function(callback) {
            this._callback = callback;
          },
          offClick: function(callback) {
            this._callback = null;
          },
          show: function() {
            this.isVisible = true;
            console.log("Main button shown");
          },
          hide: function() {
            this.isVisible = false;
            console.log("Main button hidden");
          },
          enable: function() {
            this.isActive = true;
          },
          disable: function() {
            this.isActive = false;
          },
          showProgress: function() {
            this.isProgressVisible = true;
          },
          hideProgress: function() {
            this.isProgressVisible = false;
          },
          setParams: function(params) {
            if (params.text) this.text = params.text;
            if (params.color) this.color = params.color;
            if (params.text_color) this.textColor = params.text_color;
            if (params.is_active !== undefined) this.isActive = params.is_active;
            if (params.is_visible !== undefined) this.isVisible = params.is_visible;
            console.log("Main button params set:", params);
          }
        },
        
        BackButton: {
          isVisible: false,
          show: function() {
            this.isVisible = true;
          },
          hide: function() {
            this.isVisible = false;
          },
          onClick: function(callback) {
            this._callback = callback;
          },
          offClick: function(callback) {
            this._callback = null;
          }
        },
        
        ready: function() {
          console.log("WebApp ready");
        },
        showAlert: function(message) {
          alert(message);
        },
        showConfirm: function(message, callback) {
          const confirmed = confirm(message);
          callback(confirmed);
        },
        
        geolocation: {
          getCurrentPosition: function(success, error, options) {
            // Simuler une position à Marseille
            success({
              coords: {
                latitude: 43.2965,
                longitude: 5.3698,
                altitude: null,
                accuracy: 10,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            });
          }
        },
        
        sendData: function(data) {
          console.log("Data sent to bot:", data);
        },
        onEvent: function(eventType, callback) {},
        offEvent: function(eventType, callback) {}
      }
    };
  
    console.log('Mock Telegram WebApp configuré avec succès');
  }