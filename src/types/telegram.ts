// src/types/telegram.ts
// Types for Telegram WebApp based on @twa-dev/sdk

// User type
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
    is_premium?: boolean;
    is_bot?: boolean;
    added_to_attachment_menu?: boolean;
    allows_write_to_pm?: boolean;
}

// Chat type
export interface TelegramChat {
    id: number;
    type: "group" | "supergroup" | "channel";
    title: string;
    username?: string;
    photo_url?: string;
}

// Init data
export interface TelegramInitData {
    query_id?: string;
    auth_date: number;
    hash: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    start_param?: string;
    can_send_after?: number;
    chat?: TelegramChat;
    chat_type?: "sender" | "private" | "group" | "supergroup" | "channel";
    chat_instance?: string;
}

// Theme parameters
export interface TelegramThemeParams {
    bg_color: `#${string}`;
    secondary_bg_color: `#${string}`;
    text_color: `#${string}`;
    hint_color: `#${string}`;
    link_color: `#${string}`;
    button_color: `#${string}`;
    button_text_color: `#${string}`;
}

// Haptic feedback
export interface TelegramHapticFeedback {
    impactOccurred: (
        style: "light" | "medium" | "heavy" | "rigid" | "soft"
    ) => TelegramHapticFeedback;
    notificationOccurred: (
        type: "error" | "success" | "warning"
    ) => TelegramHapticFeedback;
    selectionChanged: () => TelegramHapticFeedback;
}

// Cloud storage
export type TelegramCloudStorageKey = string;
export type TelegramCloudStorageValue = string;

export interface TelegramCloudStorageItems {
    [key: TelegramCloudStorageKey]: TelegramCloudStorageValue;
}

export interface TelegramCloudStorage {
    setItem: (
        key: TelegramCloudStorageKey,
        value: TelegramCloudStorageValue,
        callback?: (error: string | null, result?: boolean) => void
    ) => void;
    getItem: (
        key: TelegramCloudStorageKey,
        callback?: (error: string | null, result?: TelegramCloudStorageValue) => void
    ) => void;
    getItems: (
        keys: Array<TelegramCloudStorageKey>,
        callback?: (error: string | null, result?: TelegramCloudStorageItems) => void
    ) => void;
    getKeys: (
        callback?: (error: string | null, result?: Array<TelegramCloudStorageKey>) => void
    ) => void;
    removeItem: (
        key: TelegramCloudStorageKey,
        callback?: (error: string | null, result?: boolean) => void
    ) => void;
    removeItems: (
        key: Array<TelegramCloudStorageKey>,
        callback?: (error: string | null, result?: boolean) => void
    ) => void;
}

// Back button
export interface TelegramBackButton {
    isVisible: boolean;
    show: VoidFunction;
    hide: VoidFunction;
    onClick: (cb: VoidFunction) => void;
    offClick: (cb: VoidFunction) => void;
}

// Main button
export interface TelegramMainButton {
    isActive: boolean;
    isVisible: boolean;
    isProgressVisible: boolean;
    text: string;
    color: `#${string}`;
    textColor: `#${string}`;
    show: VoidFunction;
    hide: VoidFunction;
    enable: VoidFunction;
    disable: VoidFunction;
    hideProgress: VoidFunction;
    showProgress: (leaveActive?: boolean) => void;
    onClick: (callback: VoidFunction) => void;
    offClick: (callback: VoidFunction) => void;
    setText: (text: string) => void;
    setParams: (params: {
        color?: string;
        text?: string;
        text_color?: string;
        is_active?: boolean;
        is_visible?: boolean;
    }) => void;
}

// Invoice statuses
export type TelegramInvoiceStatuses = "pending" | "failed" | "cancelled" | "paid";

// Event names and parameters
export type TelegramEventNames =
    | "invoiceClosed"
    | "settingsButtonClicked"
    | "backButtonClicked"
    | "mainButtonClicked"
    | "viewportChanged"
    | "themeChanged"
    | "popupClosed"
    | "qrTextReceived"
    | "clipboardTextReceived"
    | "writeAccessRequested"
    | "contactRequested";

export type TelegramEventParams = {
    invoiceClosed: { url: string; status: TelegramInvoiceStatuses };
    settingsButtonClicked: void;
    backButtonClicked: void;
    mainButtonClicked: void;
    viewportChanged: { isStateStable: boolean };
    themeChanged: void;
    popupClosed: { button_id: string | null };
    qrTextReceived: { data: string };
    clipboardTextReceived: { data: string };
    writeAccessRequested: { status: "allowed" | "cancelled" };
    contactRequested: { status: "sent" | "cancelled" };
};

// Popup types
export type TelegramPopupParams = {
    title?: string;
    message: string;
    buttons?: TelegramPopupButton[];
};

export type TelegramPopupButton = {
    id?: string;
} & (
    | {
        type: "default" | "destructive";
        text: string;
    }
    | {
        type: "ok" | "close" | "cancel";
    }
);

export type TelegramScanQrPopupParams = {
    text?: string;
};

// Platform types
export type TelegramPlatforms =
    | "android"
    | "android_x"
    | "ios"
    | "macos"
    | "tdesktop"
    | "weba"
    | "webk"
    | "unigram"
    | "unknown";

// Main WebApp interface
export interface TelegramWebApp {
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    platform: TelegramPlatforms;
    headerColor: `#${string}`;
    backgroundColor: `#${string}`;
    isClosingConfirmationEnabled: boolean;
    themeParams: TelegramThemeParams;
    initDataUnsafe: TelegramInitData;
    initData: string;
    colorScheme: "light" | "dark";
    onEvent: <T extends TelegramEventNames>(
        eventName: T,
        callback: (params: TelegramEventParams[T]) => unknown
    ) => void;
    offEvent: <T extends TelegramEventNames>(
        eventName: T,
        callback: (params: TelegramEventParams[T]) => unknown
    ) => void;
    sendData: (data: unknown) => void;
    close: VoidFunction;
    expand: VoidFunction;
    MainButton: TelegramMainButton;
    HapticFeedback: TelegramHapticFeedback;
    CloudStorage: TelegramCloudStorage;
    openLink: (link: string, options?: { try_instant_view: boolean }) => void;
    openTelegramLink: (link: string) => void;
    BackButton: TelegramBackButton;
    version: string;
    isVersionAtLeast: (version: string) => boolean;
    openInvoice: (
        url: string,
        callback?: (status: TelegramInvoiceStatuses) => unknown
    ) => void;
    setHeaderColor: (
        color: "bg_color" | "secondary_bg_color" | `#${string}`
    ) => void;
    setBackgroundColor: (
        color: "bg_color" | "secondary_bg_color" | `#${string}`
    ) => void;
    showConfirm: (
        message: string,
        callback?: (confirmed: boolean) => void
    ) => void;
    showPopup: (params: TelegramPopupParams, callback?: (id?: string) => unknown) => void;
    showAlert: (message: string, callback?: () => unknown) => void;
    enableClosingConfirmation: VoidFunction;
    disableClosingConfirmation: VoidFunction;
    showScanQrPopup: (
        params: TelegramScanQrPopupParams,
        callback?: (text: string) => void | true
    ) => void;
    closeScanQrPopup: () => void;
    readTextFromClipboard: (callback?: (text: string) => unknown) => void;
    ready: VoidFunction;
    switchInlineQuery: (
        query: string,
        chooseChatTypes?: Array<"users" | "bots" | "groups" | "channels">
    ) => void;
    requestWriteAccess: (callback?: (access: boolean) => unknown) => void;
    requestContact: (callback?: (access: boolean) => unknown) => void;
}

// Theme interface for compatibility with existing code
export interface TelegramTheme {
    colorScheme: 'light' | 'dark';
    backgroundColor: string;
    secondaryBackgroundColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    hintColor: string;
}

// Global declaration for Window
declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
        WebApp?: TelegramWebApp;
    }
}