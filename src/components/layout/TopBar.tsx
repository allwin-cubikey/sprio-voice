import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, Plus, Phone } from 'lucide-react';
import { useUIStore } from '@/store';

const pageNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/assistants': 'Assistants',
    '/assistants/new': 'Create Assistant',
    '/phone-numbers': 'Phone Numbers',
    '/calls': 'Call Logs',
    '/squads': 'Squads',
    '/tools': 'Tools',
    '/files': 'Files',
    '/analytics': 'Analytics',
    '/api-keys': 'API Keys',
    '/billing': 'Billing',
    '/docs': 'Documentation',
    '/settings': 'Settings',
};

export function TopBar() {
    const location = useLocation();
    const { setCommandPaletteOpen, setOutboundCallOpen } = useUIStore();
    const [notifications] = useState(3);

    const pathParts = location.pathname.split('/').filter(Boolean);
    const pageName = pageNames[location.pathname] || (pathParts[0] ? pageNames[`/${pathParts[0]}`] + ' / Detail' : 'Dashboard');

    return (
        <header className="h-14 border-b border-border bg-[#0a0a0a] flex items-center gap-4 px-6 flex-shrink-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm font-semibold text-text-primary">{pageName}</span>
            </div>

            {/* Search */}
            <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 bg-card border border-border rounded-input px-3 py-1.5 text-sm text-text-muted hover:border-accent/50 transition-colors w-56 text-left"
            >
                <Search className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1">Search...</span>
                <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setOutboundCallOpen(true)}
                    className="flex items-center gap-1.5 btn-primary py-1.5"
                >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Make Call</span>
                </button>

                <button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                    )}
                </button>

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-[10px] text-accent font-semibold">JD</span>
                    </div>
                    <span className="text-sm text-text-secondary">Acme Corp</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>
            </div>
        </header>
    );
}
