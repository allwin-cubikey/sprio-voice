import React from 'react';
import { Users, Building2, Bot, PhoneCall, DollarSign, TrendingUp, TrendingDown, Activity, Clock, UserCheck } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPlatformStats, getRevenueData, mockAdminUsers, mockAdminCalls } from '../adminMockData';
import { format, subDays } from 'date-fns';
import { clsx } from 'clsx';

const stats = getPlatformStats();
const revenueData = getRevenueData();

// Call volume last 14 days
const callVolumeData = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    return {
        day: format(d, 'MMM d'),
        calls: Math.floor(80 + Math.random() * 200),
        failed: Math.floor(2 + Math.random() * 15),
    };
});

function KPICard({ label, value, sub, icon: Icon, color, trend }: {
    label: string; value: string | number; sub?: string;
    icon: React.ElementType; color: string; trend?: number;
}) {
    return (
        <div className="rounded-xl border border-rose-900/20 p-4 flex flex-col gap-3" style={{ background: '#150a0a' }}>
            <div className="flex items-start justify-between">
                <p className="text-xs text-rose-200/50 font-medium uppercase tracking-wide">{label}</p>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                {sub && <p className="text-xs text-rose-200/40 mt-0.5">{sub}</p>}
            </div>
            {trend !== undefined && (
                <div className={clsx('flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(trend)}% vs last month
                </div>
            )}
        </div>
    );
}

const recentSignups = [...mockAdminUsers]
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 6);

const planColors: Record<string, string> = {
    free: 'text-rose-300/50',
    starter: 'text-sky-400',
    growth: 'text-violet-400',
    enterprise: 'text-amber-400',
};

export function AdminDashboardPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-white">Platform Overview</h1>
                <p className="text-sm text-rose-200/40 mt-0.5">Real-time platform metrics across all users and organizations</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Users" value={stats.totalUsers} sub={`${stats.activeUsers} active`} icon={Users} color="bg-rose-700" trend={12.4} />
                <KPICard label="Platform MRR" value={`$${stats.totalMRR.toLocaleString()}`} sub="monthly recurring" icon={DollarSign} color="bg-emerald-700" trend={8.1} />
                <KPICard label="Total Calls" value={stats.totalCalls.toLocaleString()} sub="all time" icon={PhoneCall} color="bg-violet-700" trend={21.3} />
                <KPICard label="Total Assistants" value={stats.totalAssistants} sub="across all orgs" icon={Bot} color="bg-sky-700" trend={5.7} />
                <KPICard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="all time" icon={Activity} color="bg-amber-700" />
                <KPICard label="Avg Call Duration" value={`${stats.avgCallDuration}s`} sub="platform average" icon={Clock} color="bg-teal-700" trend={-2.1} />
                <KPICard label="Organizations" value={stats.totalUsers - 1} sub="active workspaces" icon={Building2} color="bg-pink-700" trend={9.8} />
                <KPICard label="Banned / Suspended" value={mockAdminUsers.filter(u => u.status !== 'active').length} sub="require attention" icon={UserCheck} color="bg-red-900" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Call volume */}
                <div className="lg:col-span-2 rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                    <h2 className="text-sm font-semibold text-rose-100 mb-1">Platform Call Volume</h2>
                    <p className="text-xs text-rose-200/40 mb-4">Last 14 days, all organizations</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={callVolumeData}>
                            <defs>
                                <linearGradient id="adminCallGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.08)" />
                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,200,210,0.4)' }} />
                            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,200,210,0.4)' }} />
                            <Tooltip contentStyle={{ background: '#1a0808', border: '1px solid rgba(225,29,72,0.3)', borderRadius: 8, fontSize: 12 }} />
                            <Area type="monotone" dataKey="calls" stroke="#e11d48" fill="url(#adminCallGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="none" strokeWidth={1} strokeDasharray="4 2" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by month */}
                <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                    <h2 className="text-sm font-semibold text-rose-100 mb-1">MRR Trend</h2>
                    <p className="text-xs text-rose-200/40 mb-4">Last 6 months</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.08)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,200,210,0.4)' }} />
                            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,200,210,0.4)' }} />
                            <Tooltip contentStyle={{ background: '#1a0808', border: '1px solid rgba(225,29,72,0.3)', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="mrr" fill="#be123c" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="newRevenue" fill="#10b981" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Plan breakdown + recent signups */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Plan distribution */}
                <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                    <h2 className="text-sm font-semibold text-rose-100 mb-4">Plan Distribution</h2>
                    <div className="space-y-3">
                        {Object.entries(stats.planBreakdown).map(([plan, count]) => (
                            <div key={plan}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className={clsx('capitalize font-medium', planColors[plan])}>{plan}</span>
                                    <span className="text-rose-200/50">{count} users</span>
                                </div>
                                <div className="h-1.5 bg-rose-900/30 rounded-full">
                                    <div className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                                        style={{ width: `${(count / stats.totalUsers) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent signups */}
                <div className="lg:col-span-2 rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                    <h2 className="text-sm font-semibold text-rose-100 mb-4">Recent Signups</h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-rose-200/40 border-b border-rose-900/30">
                                <th className="text-left pb-2 font-medium">Name</th>
                                <th className="text-left pb-2 font-medium">Company</th>
                                <th className="text-left pb-2 font-medium">Plan</th>
                                <th className="text-left pb-2 font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSignups.map(u => (
                                <tr key={u.id} className="border-b border-rose-900/20 hover:bg-rose-900/10 transition-colors">
                                    <td className="py-2 text-rose-100">{u.firstName} {u.lastName}</td>
                                    <td className="py-2 text-rose-200/60">{u.company}</td>
                                    <td className="py-2"><span className={clsx('capitalize font-semibold', planColors[u.plan])}>{u.plan}</span></td>
                                    <td className="py-2 text-rose-200/40">{format(new Date(u.joinedAt), 'MMM d, yyyy')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
