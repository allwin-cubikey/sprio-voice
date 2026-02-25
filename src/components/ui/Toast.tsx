import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, Toast } from '@/store';
import { clsx } from 'clsx';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const colors = {
    success: 'border-success/30 bg-success/10 text-success',
    error: 'border-error/30 bg-error/10 text-error',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    info: 'border-accent/30 bg-accent/10 text-accent',
};

function ToastItem({ toast }: { toast: Toast }) {
    const { removeToast } = useToastStore();
    const Icon = icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className={clsx(
                'flex items-start gap-3 p-3.5 rounded-card border shadow-lg max-w-xs w-full',
                'bg-card',
                colors[toast.type]
            )}
        >
            <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
}

export function ToastContainer() {
    const { toasts } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
