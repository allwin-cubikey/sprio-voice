import React from 'react';
import { clsx } from 'clsx';

interface WaveformVisualizerProps {
    active?: boolean;
    bars?: number;
    className?: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function WaveformVisualizer({ active = false, bars = 7, className, color = '#6366f1', size = 'md' }: WaveformVisualizerProps) {
    const heights = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;
    const barW = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;
    const gap = size === 'sm' ? 2 : size === 'lg' ? 3 : 2;

    return (
        <div className={clsx('flex items-center', className)} style={{ gap, height: heights }}>
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className={clsx('rounded-full', active && 'wave-bar')}
                    style={{
                        width: barW,
                        height: heights,
                        backgroundColor: active ? color : 'rgba(255,255,255,0.15)',
                        minHeight: 4,
                        animationDelay: `${i * 0.1}s`,
                        transform: active ? undefined : 'scaleY(0.3)',
                        transition: 'background-color 0.3s',
                    }}
                />
            ))}
        </div>
    );
}

// Skeleton loader
export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={clsx('animate-pulse bg-white/5 rounded', className)} />
    );
}

// Empty state
interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="p-4 rounded-full bg-white/5 mb-4 text-text-muted">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm">{description}</p>
            {action}
        </div>
    );
}

// Status Badge
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'gray' | 'purple' | 'blue';
    className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
    return (
        <span className={clsx(`badge-${variant}`, className)}>{children}</span>
    );
}

// Modal wrapper
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
    const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={clsx('relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full', widths[size])}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-semibold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// Copy to clipboard button with toast
export function CopyButton({ value, className }: { value: string; className?: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={clsx(
                'text-xs px-2 py-0.5 rounded border transition-colors',
                copied
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-white/5 border-border text-text-muted hover:text-text-primary hover:border-accent/50',
                className
            )}
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

// Stat card with sparkline placeholder
export function StatCard({ title, value, change, trend, icon: Icon }: {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: any;
}) {
    return (
        <div className="stat-card">
            <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{title}</span>
                {Icon && <div className="p-2 rounded-lg bg-accent/10"><Icon className="w-4 h-4 text-accent" /></div>}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-text-primary">{value}</span>
                {change && (
                    <span className={clsx(
                        'text-xs font-medium mb-0.5',
                        trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-muted'
                    )}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
                    </span>
                )}
            </div>
        </div>
    );
}

// Code block with copy
export function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
    return (
        <div className="relative code-block group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton value={code} />
            </div>
            <pre className="font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap">{code}</pre>
        </div>
    );
}

// Confirm dialog
interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-text-secondary mb-6">{message}</p>
            <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose(); }}>
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
