// src/components/common/TelegramDebugPanel.tsx
import React, { useState } from 'react';

const TelegramDebugPanel: React.FC = () => {
    if (!import.meta.env.DEV) return null;
    
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const panelStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        maxHeight: isExpanded ? '200px' : '40px',
        overflow: 'auto',
        transition: 'max-height 0.3s ease-in-out'
    } as React.CSSProperties;

    const buttonStyle = {
        padding: '4px 8px',
        backgroundColor: '#2AABEE',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        marginRight: '5px',
        cursor: 'pointer',
        fontSize: '11px'
    } as React.CSSProperties;

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '8px' : '0'
    } as React.CSSProperties;

    return (
        <div style={panelStyle}>
            <div style={headerStyle}>
                <strong>Telegram Debug {isExpanded ? '' : '(Masqué)'}</strong>
                <div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={buttonStyle}
                    >
                        {isExpanded ? 'Masquer' : 'Afficher'}
                    </button>
                    <button
                        onClick={() => window.location.href = `${window.location.pathname}?telegram=true`}
                        style={buttonStyle}
                    >
                        Force Telegram Mode
                    </button>
                </div>
            </div>
            
            {isExpanded && (
                <div>
                    <pre>{JSON.stringify({
                        telegramExists: !!window.Telegram,
                        webAppExists: !!window.Telegram?.WebApp,
                        userInfo: window.Telegram?.WebApp?.initDataUnsafe?.user,
                        href: window.location.href
                    }, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TelegramDebugPanel;