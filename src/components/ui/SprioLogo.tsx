import React from 'react';
import { clsx } from 'clsx';

interface SprioLogoProps {
    height?: number;
    className?: string;
    /** 'full' = text + magenta O, 'mark' = just the magenta ring */
    variant?: 'full' | 'mark';
}

export function SprioLogo({ height = 28, className, variant = 'full' }: SprioLogoProps) {
    if (variant === 'mark') {
        // Just the magenta ring — used in collapsed sidebars
        return (
            <svg height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={clsx(className)}>
                <circle cx="16" cy="16" r="12" stroke="#CC00CC" strokeWidth="6" fill="none" />
            </svg>
        );
    }

    // Full logo: "spri" in white + magenta ring "o"
    // Derived from actual brand proportions
    return (
        <svg
            height={height}
            viewBox="0 0 200 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={clsx(className)}
        >
            {/* "spri" text */}
            <text
                y="36"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"
                fontWeight="700"
                fontSize="42"
                fill="white"
                letterSpacing="-2"
            >
                spri
            </text>
            {/* Magenta "o" ring — positioned after "spri" (~110px) */}
            <circle cx="130" cy="22" r="15" stroke="#CC00CC" strokeWidth="7.5" fill="none" />
            {/* empty space after o — no extra text needed, "sprio" ends here */}
        </svg>
    );
}
