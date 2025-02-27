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

    useEffect(() => {
        if (isInTelegram() && !initialized) {
            initTelegramApp();
            setInitialized(true);
        }
    }, [initialized]);

    return {
        initialized,
        inTelegram: isInTelegram(),
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