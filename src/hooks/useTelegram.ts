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
        // Check if Telegram is available
        const checkTelegram = () => {
            // Use isInTelegram function for more reliable detection
            const isTelegramAvailable = isInTelegram();
            console.log('Checking Telegram availability:', isTelegramAvailable);
            setTelegramDetected(isTelegramAvailable);

            if (isTelegramAvailable && !initialized) {
                // Initialize Telegram app
                initTelegramApp();
                setInitialized(true);
                console.log('Telegram WebApp initialized from hook');
            }
        };

        checkTelegram();
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