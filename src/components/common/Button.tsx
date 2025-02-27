// src/components/common/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    isLoading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    fullWidth = false,
    icon,
    className = '',
    disabled,
    size = 'md',
    ...props
}) => {
    const baseClasses = "rounded-lg font-medium focus:outline-none transition duration-150 flex items-center justify-center";

    const variantClasses = {
        primary: "bg-telegram-primary text-white hover:bg-telegram-dark",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        outline: "border border-telegram-primary text-telegram-primary hover:bg-telegram-light",
        text: "text-telegram-primary hover:bg-telegram-light"
    };

    const sizeClasses = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };

    const widthClass = fullWidth ? "w-full" : "";
    const disabledClass = disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {icon && !isLoading && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;