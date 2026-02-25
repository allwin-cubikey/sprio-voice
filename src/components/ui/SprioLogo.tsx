import React from 'react';
import { clsx } from 'clsx';

interface SprioLogoProps {
    height?: number;
    className?: string;
    /** 'full' = actual logo image | 'mark' = magenta ring only */
    variant?: 'full' | 'mark';
}

export function SprioLogo({ height = 28, className, variant = 'full' }: SprioLogoProps) {
    const ringSize = Math.round(height * 0.9);
    const ringStroke = Math.round(height * 0.25);

    if (variant === 'mark') {
        return (
            <div
                className={clsx('flex-shrink-0', className)}
                style={{
                    width: ringSize,
                    height: ringSize,
                    borderRadius: '50%',
                    border: `${ringStroke}px solid #CC00CC`,
                    boxSizing: 'border-box',
                }}
            />
        );
    }

    // Use the actual brand logo image
    return (
        <img
            src="/sprio-logo.png"
            alt="Sprio"
            height={height}
            style={{ height, width: 'auto', display: 'block', userSelect: 'none' }}
            className={clsx('flex-shrink-0', className)}
            draggable={false}
        />
    );
}
