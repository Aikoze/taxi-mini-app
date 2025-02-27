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
    isInTelegram
} from '../utils/telegram';
import { TelegramUser } from '../types/telegram';

export const useTelegram = () => {
    const [initialized, setInitialized] = useState<boolean>(false);
    const [telegramDetected, setTelegramDetected] = useState<boolean>(false);


    useEffect(() => {
        // Vérifier si Telegram est disponible
        const checkTelegram = () => {
            const isTelegramAvailable = !!window.Telegram?.WebApp;
            console.log('Checking Telegram availability:', isTelegramAvailable);
            setTelegramDetected(isTelegramAvailable);

            if (isTelegramAvailable && !initialized) {
                initTelegramApp();
                setInitialized(true);
            }
        };

        // Vérifier immédiatement et après un délai
        checkTelegram();
        const timeoutId = setTimeout(checkTelegram, 1000);

        return () => clearTimeout(timeoutId);
    }, [initialized]);

    return {
        initialized,
        inTelegram: telegramDetected,
        user: getTelegramUser(),
        initData: getTelegramInitData(),
        setMainButtonVisible,
        setMainButtonText,
        setMainButtonLoading,
        onMainButtonClick,
        close: closeTelegramWebApp,
        requestLocation,
        showAlert: showTelegramAlert,
        showConfirm: showTelegramConfirm,
        theme: getTelegramTheme()
    };
};