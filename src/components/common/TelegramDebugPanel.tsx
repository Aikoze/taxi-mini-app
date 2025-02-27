// src/components/common/TelegramDebugPanel.tsx
import React from 'react';

const TelegramDebugPanel: React.FC = () => {
  if (!import.meta.env.DEV) return null;
  
  const mainButtonStyle = {
    position: 'fixed',
    bottom: '80px',
    left: '0',
    right: '0',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#2AABEE',
    color: '#FFFFFF',
    display: window.Telegram?.WebApp?.MainButton?.isVisible ? 'block' : 'none',
    zIndex: 9999,
  } as React.CSSProperties;

  const panelStyle = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #ddd',
    padding: '8px',
    display: 'flex',
    justifyContent: 'space-around',
    zIndex: 9999,
  } as React.CSSProperties;

  const buttonStyle = {
    padding: '6px 10px',
    borderRadius: '4px',
    backgroundColor: '#2AABEE',
    color: 'white',
    border: 'none',
    fontSize: '12px',
  };

  return (
    <>
      {/* Simuler le bouton principal de Telegram */}
      <div style={mainButtonStyle}>
        {window.Telegram?.WebApp?.MainButton?.text || 'Continuer'}
      </div>

      {/* Panneau de debug */}
      <div style={panelStyle}>
        <button 
          style={buttonStyle}
          onClick={() => window.Telegram?.WebApp?.MainButton?.show()}
        >
          Show Main Button
        </button>
        <button 
          style={buttonStyle}
          onClick={() => window.Telegram?.WebApp?.MainButton?.hide()}
        >
          Hide Main Button
        </button>
        <button 
          style={buttonStyle}
          onClick={() => window.Telegram?.WebApp?.showAlert('Test alert')}
        >
          Show Alert
        </button>
        <button 
          style={buttonStyle}
          onClick={() => {
            window.Telegram?.WebApp?.geolocation?.getCurrentPosition(
              (pos) => {
                window.Telegram?.WebApp?.showAlert(
                  `Position: ${pos.coords.latitude}, ${pos.coords.longitude}`
                );
              },
              (error) => {
                window.Telegram?.WebApp?.showAlert(`Error getting location: ${error.message}`);
              }
            );
          }}
        >
          Get Location
        </button>
      </div>
    </>
  );
};

export default TelegramDebugPanel;