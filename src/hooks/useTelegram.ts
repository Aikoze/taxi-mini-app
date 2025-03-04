// src/hooks/useTelegram.ts
import { useEffect, useState } from 'react';
import {
    initTelegramApp,
    getTelegramUser,
    getTelegramInitData,
    setMainButtonVisible,
    setMainButtonText,
    setMainButtonLoading,
    onMainButtonClick,
    closeTelegramWebApp,
    requestLocation,
    showTelegramAlert,
    showTelegramConfirm,
    getTelegramTheme,
    isInTelegram,
    twaDevWebApp as WebApp
} from '../utils/telegramSdk';

export const useTelegram = () => {
    const [initialized, setInitialized] = useState<boolean>(false);
    const [telegramDetected, setTelegramDetected] = useState<boolean>(false);

    useEffect(() => {
        console.log('%c[useTelegram] Initialisation du hook useTelegram', 'color: orange; font-weight: bold');
        
        // Check if Telegram is available
        const checkTelegram = () => {
            // Vérifier la présence des objets Telegram
            console.log('[useTelegram] Vérification de l\'environnement Telegram:');
            console.log('[useTelegram] - window.Telegram:', window.Telegram ? 'présent' : 'absent');
            console.log('[useTelegram] - WebApp (twa-dev/sdk):', WebApp ? 'présent' : 'absent');
            
            // Vérifier l'URL pour les paramètres
            const urlParams = new URLSearchParams(window.location.search);
            const forceTelegram = urlParams.get('telegram') === 'true';
            console.log('[useTelegram] - Paramètre telegram dans l\'URL:', forceTelegram ? 'OUI' : 'NON');
            
            // Vérifier si nous sommes dans un iframe
            const isInIframe = window !== window.parent;
            console.log('[useTelegram] - Dans un iframe:', isInIframe ? 'OUI' : 'NON');
            
            // Use isInTelegram function for more reliable detection
            const isTelegramAvailable = isInTelegram();
            console.log('[useTelegram] Résultat de la détection Telegram:', isTelegramAvailable ? 'DÉTECTÉ' : 'NON DÉTECTÉ');
            
            setTelegramDetected(isTelegramAvailable);

            if (isTelegramAvailable && !initialized) {
                console.log('[useTelegram] Initialisation de l\'application Telegram...');
                // Initialize Telegram app
                initTelegramApp();
                setInitialized(true);
                console.log('[useTelegram] Application Telegram initialisée avec succès');
            } else if (!isTelegramAvailable) {
                console.log('[useTelegram] Environnement Telegram non détecté, pas d\'initialisation');
            } else if (initialized) {
                console.log('[useTelegram] Application Telegram déjà initialisée');
            }
        };

        checkTelegram();
        
        // Log les données utilisateur au premier rendu
        try {
            const user = getTelegramUser();
            console.log('[useTelegram] Informations utilisateur Telegram:', user || 'aucune');
        } catch (error) {
            console.error('[useTelegram] Erreur lors de la récupération des données utilisateur:', error);
        }
        
    }, [initialized]);

    return {
        telegramDetected,
        initialized,
        inTelegram: telegramDetected,
        user: getTelegramUser(),
        initData: getTelegramInitData(),

        // Main button functions
        setMainButtonVisible,
        setMainButtonText,
        setMainButtonLoading,
        onMainButtonClick,
        MainButton: (() => {
            return WebApp?.MainButton;
        })(),

        // App functions
        close: closeTelegramWebApp,
        showAlert: showTelegramAlert,
        showConfirm: showTelegramConfirm,

        // Theme
        theme: getTelegramTheme(),

        // Location
        requestLocation,

        // Direct access to WebApp
        WebApp
    };
};