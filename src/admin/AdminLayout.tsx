import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Building2, Bot, PhoneCall,
    CreditCard, Settings, LogOut, ChevronLeft, ChevronRight,
    Bell, AlertTriangle, Activity,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { clsx } from 'clsx';
import { SprioLogo } from '@/components/ui/SprioLogo';

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Organizations', icon: Building2, path: '/admin/orgs' },
    { label: 'Assistants', icon: Bot, path: '/admin/assistants' },
    { label: 'Calls', icon: PhoneCall, path: '/admin/calls' },
    { label: 'Billing & Revenue', icon: CreditCard, path: '/admin/billing' },
    { label: 'System', icon: Settings, path: '/admin/system' },
];

export function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside className={clsx(
                'flex flex-col border-r transition-all duration-300 flex-shrink-0',
                'border-rose-900/40',
                collapsed ? 'w-14' : 'w-56',
            )}
                style={{ background: 'linear-gradient(180deg, #150a0a 0%, #0e0505 100%)' }}>

                {/* Logo */}
                <div className={clsx('flex items-center gap-2 px-3 py-4 border-b border-rose-900/30', collapsed && 'justify-center px-0')}>
                    {collapsed
                        ? <SprioLogo variant="mark" height={26} />
                        : (
                            <div className="flex items-center gap-2">
                                <SprioLogo height={20} />
                                <span className="text-[10px] font-bold text-rose-400 border border-rose-600/40 bg-rose-600/15 px-1.5 py-0.5 rounded">
                                    ADMIN
                                </span>
                            </div>
                        )
                    }
                </div>

                {/* Nav */}
                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ label, icon: Icon, path }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/admin'}
                            className={({ isActive }) => clsx(
                                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-sm group',
                                collapsed && 'justify-center px-0',
                                isActive
                                    ? 'bg-rose-600/20 text-rose-400 border border-rose-600/30'
                                    : 'text-rose-200/60 hover:bg-rose-900/30 hover:text-rose-200 border border-transparent',
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && <span className="truncate">{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User footer */}
                <div className={clsx('p-2 border-t border-rose-900/30 space-y-1', collapsed && 'flex flex-col items-center')}>
                    {!collapsed ? (
                        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-rose-900/20 border border-rose-900/30">
                            <div className="w-7 h-7 rounded-full bg-rose-600/40 flex items-center justify-center flex-shrink-0">
                                <span className="text-rose-300 font-bold text-[10px]">{user?.avatarInitials || 'SA'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-rose-100 truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-[10px] text-rose-400/70 truncate">Super Admin</p>
                            </div>
                            <button onClick={handleLogout} title="Sign out"
                                className="text-rose-400/60 hover:text-rose-300 transition-colors p-0.5">
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLogout} title="Sign out"
                            className="text-rose-400/60 hover:text-rose-300 transition-colors p-2">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center p-1.5 rounded-md text-rose-400/40 hover:text-rose-300 hover:bg-rose-900/20 transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-12 flex items-center justify-between px-5 border-b border-rose-900/20 flex-shrink-0"
                    style={{ background: '#0e0505' }}>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-600/15 border border-rose-600/30 text-xs text-rose-400 font-semibold tracking-wide">
                            <Activity className="w-3 h-3" /> ADMIN CONSOLE
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] text-emerald-400 font-medium">All systems operational</span>
                        </div>
                        <button className="text-rose-400/60 hover:text-rose-300 transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</span>
                        </button>
                        <button className="text-rose-400/60 hover:text-rose-300 transition-colors">
                            <AlertTriangle className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-5" style={{ background: '#0a0404' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
