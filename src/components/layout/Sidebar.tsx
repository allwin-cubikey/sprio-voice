import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Bot, Phone, PhoneCall, Users, Wrench, Files,
    BarChart2, Key, CreditCard, BookOpen, Settings, ChevronLeft,
    ChevronRight, LogOut, Building2, GitBranch, Clock, TrendingUp
} from 'lucide-react';
import { useUIStore, useAuthStore } from '@/store';
import { clsx } from 'clsx';
import { SprioLogo } from '@/components/ui/SprioLogo';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Assistants', icon: Bot, path: '/assistants' },
    { label: 'Phone Numbers', icon: Phone, path: '/phone-numbers' },
    { label: 'Calls', icon: PhoneCall, path: '/calls' },
    { label: 'Session Logs', icon: Clock, path: '/session-logs' },
    { label: 'Squads', icon: Users, path: '/squads' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'Metrics', icon: TrendingUp, path: '/metrics' },
];

const bottomNavItems = [
    { label: 'API Keys', icon: Key, path: '/api-keys' },
    { label: 'Billing', icon: CreditCard, path: '/billing' },
    { label: 'Docs', icon: BookOpen, path: '/docs' },
    { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className={clsx(
                'flex flex-col h-full bg-sidebar border-r border-border transition-all duration-300 ease-in-out flex-shrink-0',
                sidebarCollapsed ? 'w-16' : 'w-60'
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border min-h-[57px]">
                <div className="flex items-center gap-2 min-w-0">
                    {sidebarCollapsed
                        ? <SprioLogo variant="mark" height={28} className="flex-shrink-0" />
                        : <SprioLogo height={24} className="flex-shrink-0" />
                    }
                </div>
                {!sidebarCollapsed && (
                    <button onClick={toggleSidebar} className="ml-auto text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
                {navItems.map(item => (
                    <SidebarLink key={item.path} {...item} collapsed={sidebarCollapsed} />
                ))}

                <div className="mt-4 mb-2 px-1">
                    {!sidebarCollapsed && <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Account</span>}
                    {sidebarCollapsed && <div className="border-t border-border my-2" />}
                </div>

                {bottomNavItems.map(item => (
                    <SidebarLink key={item.path} {...item} collapsed={sidebarCollapsed} />
                ))}
            </nav>

            {/* Footer */}
            <div className={clsx(
                'border-t border-border p-3 flex items-center gap-2',
                sidebarCollapsed && 'justify-center'
            )}>
                {sidebarCollapsed ? (
                    <button onClick={toggleSidebar} className="text-text-muted hover:text-text-primary transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-accent font-semibold text-xs">{user?.avatarInitials || 'U'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-text-primary truncate">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>
                            <p className="text-[10px] text-text-muted truncate">{user?.company || ''}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="text-text-muted hover:text-text-primary transition-colors p-1 rounded">
                                <Building2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={handleLogout} className="text-text-muted hover:text-error transition-colors p-1 rounded" title="Sign out">
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}

function SidebarLink({ label, icon: Icon, path, collapsed, badge }: { label: string; icon: any; path: string; collapsed: boolean; badge?: string }) {
    return (
        <NavLink
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium group relative',
                collapsed ? 'justify-center px-2' : '',
                isActive
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
            )}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
                <span className="flex items-center gap-2 flex-1">
                    {label}
                    {badge && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold border border-accent/30">{badge}</span>}
                </span>
            )}
            {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {label}
                </div>
            )}
        </NavLink>
    );
}
