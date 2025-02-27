// src/types/telegram.ts
// Nous utilisons maintenant les types fournis par le SDK, mais gardons quelques types personnalisés pour la compatibilité


// Type utilisateur Telegram pour la compatibilité avec le code existant
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
    is_premium?: boolean;
}

// Déclaration globale pour le type Window
declare global {
    interface Window {
        Telegram?: {
            WebApp: any;
        };
        WebApp: any;
    }
}