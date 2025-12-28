import React from "react";
import Link from "next/link";

interface PixelButtonProps {
    variant?: "primary" | "secondary" | "danger" | "success" | "outline";
    size?: "sm" | "md" | "lg";
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

const PixelButton: React.FC<PixelButtonProps> = ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    href,
    onClick,
    type = "button",
    disabled = false,
    ...props
}) => {
    const variantStyles = {
        primary: "bg-primary hover:bg-primary-hover text-white",
        secondary: "bg-secondary hover:bg-secondary-hover text-white",
        danger: "bg-danger hover:bg-danger-hover text-white",
        success: "bg-success hover:bg-success-hover text-white",
        outline: "bg-transparent border-fs-diamond text-accent-cyan shadow-pixel hover:bg-accent-cyan/10",
    };

    const sizeStyles = {
        sm: "px-2 py-1 text-[8px]",
        md: "px-4 py-2 text-[10px]",
        lg: "px-6 py-3 text-xs",
    };

    const combinedStyles = `
        pixel-font uppercase tracking-wider 
        border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
        active:shadow-none active:translate-x-[2px] active:translate-y-[2px] 
        transition-all duration-75 inline-block text-center
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${className}
    `;

    if (href && !disabled) {
        return (
            <Link href={href} className={combinedStyles} onClick={onClick}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={combinedStyles}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default PixelButton;

