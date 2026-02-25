import React from 'react';
import { clsx } from 'clsx';

interface SprioLogoProps {
    height?: number;
    className?: string;
    /** 'full' = "spri" text + magenta O ring | 'mark' = magenta ring only */
    variant?: 'full' | 'mark';
}

/**
 * Sprio brand logo — matches the provided brand image exactly.
 * White bold "spri" text with a thick magenta ring for the "o".
 * Renders using actual browser font so it matches the real logo weight.
 */
export function SprioLogo({ height = 28, className, variant = 'mark' }: SprioLogoProps) {
    // Scale all dimensions proportionally from height
    const fontSize = Math.round(height * 1.35);
    const ringSize = Math.round(height * 0.92);
    const ringStroke = Math.round(height * 0.26);

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
            {/* "spri" — white, will appear invisible on white backgrounds but great on dark */}
            <span style={{ display: 'inline-block' }}>spri</span>
            {/* "o" — magenta ring matching the brand */}
            <div
                style={{
                    width: ringSize,
                    height: ringSize,
                    borderRadius: '50%',
                    border: `${ringStroke}px solid #CC00CC`,
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    // Vertically center with the text cap-height
                    marginTop: Math.round(height * 0.01),
                }}
            />
        </div>
    );
}
