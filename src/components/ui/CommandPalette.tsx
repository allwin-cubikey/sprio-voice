import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Bot, Phone, PhoneCall, Users, Wrench, Files, BarChart2, Key, CreditCard, BookOpen, Settings, X } from 'lucide-react';
import { useUIStore } from '@/store';

const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'assistants', label: 'Go to Assistants', path: '/assistants', icon: Bot, category: 'Navigation' },
    { id: 'new-assistant', label: 'Create New Assistant', path: '/assistants/new', icon: Bot, category: 'Actions' },
    { id: 'phone-numbers', label: 'Phone Numbers', path: '/phone-numbers', icon: Phone, category: 'Navigation' },
    { id: 'calls', label: 'Call Logs', path: '/calls', icon: PhoneCall, category: 'Navigation' },
    { id: 'squads', label: 'Squads', path: '/squads', icon: Users, category: 'Navigation' },
    { id: 'tools', label: 'Tools Library', path: '/tools', icon: Wrench, category: 'Navigation' },
    { id: 'files', label: 'File Storage', path: '/files', icon: Files, category: 'Navigation' },
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart2, category: 'Navigation' },
    { id: 'api-keys', label: 'API Keys', path: '/api-keys', icon: Key, category: 'Navigation' },
    { id: 'billing', label: 'Billing & Plans', path: '/billing', icon: CreditCard, category: 'Navigation' },
    { id: 'docs', label: 'Documentation', path: '/docs', icon: BookOpen, category: 'Navigation' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, category: 'Navigation' },
];

export function CommandPalette() {
    const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandPaletteOpen(true);
            }
            if (e.key === 'Escape') setCommandPaletteOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (commandPaletteOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [commandPaletteOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && filtered[selectedIndex]) {
            navigate(filtered[selectedIndex].path);
            setCommandPaletteOpen(false);
        }
    };

    const grouped = filtered.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, typeof commands>);

    return (
        <AnimatePresence>
            {commandPaletteOpen && (
                <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-[20vh]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setCommandPaletteOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-10 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search commands..."
                                className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
                            />
                            <button onClick={() => setCommandPaletteOpen(false)} className="text-text-muted hover:text-text-primary">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto py-2">
                            {filtered.length === 0 && (
                                <div className="px-4 py-8 text-center text-text-muted text-sm">No results found</div>
                            )}
                            {Object.entries(grouped).map(([category, items]) => (
                                <div key={category}>
                                    <div className="px-4 py-1.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">{category}</div>
                                    {items.map((cmd, idx) => {
                                        const globalIdx = filtered.indexOf(cmd);
                                        const Icon = cmd.icon;
                                        return (
                                            <button
                                                key={cmd.id}
                                                onClick={() => { navigate(cmd.path); setCommandPaletteOpen(false); }}
                                                onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${selectedIndex === globalIdx ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-white/5'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4 flex-shrink-0" />
                                                {cmd.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-text-muted">
                            <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1.5 py-0.5 rounded font-mono">↑↓</kbd> navigate</span>
                            <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1.5 py-0.5 rounded font-mono">Enter</kbd> select</span>
                            <span className="flex items-center gap-1"><kbd className="bg-white/5 px-1.5 py-0.5 rounded font-mono">Esc</kbd> close</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
