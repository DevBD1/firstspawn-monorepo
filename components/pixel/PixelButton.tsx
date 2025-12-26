import React from "react";
import Link from "next/link";

interface PixelButtonProps {
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    type?: "button" | "submit" | "reset";
}

const PixelButton: React.FC<PixelButtonProps> = ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    href,
    onClick,
    type = "button",
    ...props
}) => {
    const variantStyles = {
        primary: "bg-accent-blue hover:bg-accent-blue-hover text-white",
        secondary: "bg-panel-light hover:bg-zinc-600 text-white",
        danger: "bg-red-600 hover:bg-red-500 text-white",
        success: "bg-accent-green hover:bg-green-500 text-white",
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

    if (href) {
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
            {...props}
        >
            {children}
        </button>
    );
};

export default PixelButton;

