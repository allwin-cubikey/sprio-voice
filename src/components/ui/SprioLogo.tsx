import React from 'react';
import { clsx } from 'clsx';

interface SprioLogoProps {
    height?: number;
    className?: string;
    /** 'full' = "spri" text + magenta O ring | 'mark' = magenta ring only */
    variant?: 'full' | 'mark';
}

export function SprioLogo({ height = 28, className, variant = 'full' }: SprioLogoProps) {
    const fontSize = Math.round(height * 1.4);
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

    return (
        <div
            className={clsx('flex items-center', className)}
            style={{
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontSize,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: 'white',
                gap: Math.round(height * 0.04),
                userSelect: 'none',
            }}
        >
            <span style={{ display: 'inline-block' }}>spri</span>
            <div
                style={{
                    width: ringSize,
                    height: ringSize,
                    borderRadius: '50%',
                    border: `${ringStroke}px solid #CC00CC`,
                    boxSizing: 'border-box',
                    flexShrink: 0,
                }}
            />
        </div>
    );
}
