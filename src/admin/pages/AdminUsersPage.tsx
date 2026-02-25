import React, { useState } from 'react';
import { Search, Shield, ShieldOff, Trash2, Eye, ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mockAdminUsers, AdminUser } from '../adminMockData';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const planColors: Record<string, string> = {
    free: 'bg-zinc-700/50 text-zinc-300',
    starter: 'bg-sky-900/50 text-sky-300',
    growth: 'bg-violet-900/50 text-violet-300',
    enterprise: 'bg-amber-900/50 text-amber-300',
};

const statusIcons = {
    active: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    banned: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    suspended: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
};

export function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState<AdminUser | null>(null);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchQ = !q || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q)
            || u.email.toLowerCase().includes(q) || u.company.toLowerCase().includes(q);
        const matchPlan = planFilter === 'all' || u.plan === planFilter;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchQ && matchPlan && matchStatus;
    });

    const toggleBan = (id: string) => {
        setUsers(prev => prev.map(u => u.id === id
            ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' }
            : u));
    };

    const deleteUser = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        if (selected?.id === id) setSelected(null);
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Users</h1>
                    <p className="text-sm text-rose-200/40 mt-0.5">{users.length} total users on the platform</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-400">
                        {users.filter(u => u.status === 'active').length} Active
                    </span>
                    <span className="px-2 py-1 rounded-md bg-rose-900/30 border border-rose-700/30 text-rose-400">
                        {users.filter(u => u.status === 'banned').length} Banned
                    </span>
                    <span className="px-2 py-1 rounded-md bg-amber-900/30 border border-amber-700/30 text-amber-400">
                        {users.filter(u => u.status === 'suspended').length} Suspended
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400/40" />
                    <input
                        className="w-full bg-rose-950/30 border border-rose-900/30 text-rose-100 placeholder-rose-400/30 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-rose-600/50"
                        placeholder="Search users by name, email, company…"
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                        className="appearance-none bg-rose-950/30 border border-rose-900/30 text-rose-200/70 text-xs rounded-lg pl-3 pr-7 py-2 focus:outline-none">
                        <option value="all">All Plans</option>
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-rose-400/40 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none bg-rose-950/30 border border-rose-900/30 text-rose-200/70 text-xs rounded-lg pl-3 pr-7 py-2 focus:outline-none">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-rose-400/40 pointer-events-none" />
                </div>
            </div>

            <div className="flex gap-4">
                {/* Table */}
                <div className="flex-1 rounded-xl border border-rose-900/20 overflow-hidden" style={{ background: '#150a0a' }}>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-rose-900/30 text-rose-200/40">
                                <th className="text-left px-4 py-3 font-medium">User</th>
                                <th className="text-left px-4 py-3 font-medium">Plan</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-right px-4 py-3 font-medium">Calls</th>
                                <th className="text-right px-4 py-3 font-medium">Spend</th>
                                <th className="text-left px-4 py-3 font-medium">Joined</th>
                                <th className="text-right px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id}
                                    className={clsx('border-b border-rose-900/15 hover:bg-rose-900/10 transition-colors cursor-pointer', selected?.id === u.id && 'bg-rose-900/15')}
                                    onClick={() => setSelected(selected?.id === u.id ? null : u)}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-rose-800/40 flex items-center justify-center flex-shrink-0">
                                                <span className="text-rose-200 font-semibold text-[10px]">{u.firstName[0]}{u.lastName[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-rose-100">{u.firstName} {u.lastName}</p>
                                                <p className="text-rose-200/40">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize', planColors[u.plan])}>{u.plan}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {statusIcons[u.status]}
                                            <span className="capitalize text-rose-200/60">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-rose-200/70">{u.totalCalls.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-rose-200/70">${u.totalCost.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-rose-200/40">{format(new Date(u.joinedAt), 'MMM d, yy')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setSelected(u)} className="p-1.5 rounded hover:bg-rose-900/30 text-rose-400/60 hover:text-rose-300 transition-colors" title="View details">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => toggleBan(u.id)}
                                                className="p-1.5 rounded hover:bg-rose-900/30 transition-colors"
                                                title={u.status === 'banned' ? 'Unban user' : 'Ban user'}>
                                                {u.status === 'banned'
                                                    ? <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                                    : <ShieldOff className="w-3.5 h-3.5 text-amber-400/80 hover:text-amber-300" />}
                                            </button>
                                            <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded hover:bg-rose-900/30 text-rose-400/40 hover:text-red-400 transition-colors" title="Delete user">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-rose-200/30 text-sm">No users match your filters</div>
                    )}
                </div>

                {/* Detail panel */}
                {selected && (
                    <div className="w-64 rounded-xl border border-rose-900/20 p-4 flex-shrink-0 space-y-4" style={{ background: '#150a0a' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-800/40 flex items-center justify-center">
                                <span className="text-rose-200 font-bold text-sm">{selected.firstName[0]}{selected.lastName[0]}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-rose-100">{selected.firstName} {selected.lastName}</p>
                                <p className="text-[10px] text-rose-200/40">{selected.email}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs">
                            {[
                                ['Company', selected.company],
                                ['Plan', selected.plan],
                                ['Status', selected.status],
                                ['Assistants', selected.assistantCount],
                                ['Total Calls', selected.totalCalls.toLocaleString()],
                                ['Total Spend', `$${selected.totalCost.toFixed(2)}`],
                                ['Monthly', `$${selected.monthlySpend}/mo`],
                                ['Joined', format(new Date(selected.joinedAt), 'MMM d, yyyy')],
                                ['Last Active', format(new Date(selected.lastActive), 'MMM d, yyyy')],
                                ['User ID', selected.id],
                            ].map(([k, v]) => (
                                <div key={k as string} className="flex justify-between border-b border-rose-900/20 pb-1.5">
                                    <span className="text-rose-200/40">{k}</span>
                                    <span className="text-rose-100 font-medium capitalize">{v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <button onClick={() => toggleBan(selected.id)}
                                className="w-full py-1.5 rounded-lg text-xs font-medium border border-rose-900/30 text-rose-200/60 hover:bg-rose-900/20 transition-colors">
                                {selected.status === 'banned' ? '✓ Unban User' : '⛔ Ban User'}
                            </button>
                            <button onClick={() => deleteUser(selected.id)}
                                className="w-full py-1.5 rounded-lg text-xs font-medium bg-red-900/20 border border-red-900/30 text-red-400 hover:bg-red-900/40 transition-colors">
                                🗑 Delete User
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
