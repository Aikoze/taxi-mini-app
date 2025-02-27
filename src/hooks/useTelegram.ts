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
            // Utiliser la fonction isInTelegram pour une détection plus fiable
            const isTelegramAvailable = isInTelegram();
            console.log('Checking Telegram availability:', isTelegramAvailable);
            setTelegramDetected(isTelegramAvailable);

            if (isTelegramAvailable && !initialized) {
                initTelegramApp();
                setInitialized(true);
            }
        };

        // Vérifier immédiatement et après plusieurs délais
        // Certains environnements Telegram peuvent prendre du temps à initialiser l'API
        checkTelegram();
        
        const timeoutIds = [
            setTimeout(checkTelegram, 500),
            setTimeout(checkTelegram, 1000),
            setTimeout(checkTelegram, 2000)
        ];

        return () => timeoutIds.forEach(id => clearTimeout(id));
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