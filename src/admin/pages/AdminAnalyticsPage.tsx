import React, { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, PhoneCall, DollarSign, Bot,
    Clock, BarChart2, Globe, Zap, AlertTriangle, CheckCircle, Download, RefreshCw,
} from 'lucide-react';
import {
    mockAdminUsers, mockAdminCalls, mockAdminOrgs, getRevenueData, getPlatformStats,
} from '../adminMockData';
import { subDays, format } from 'date-fns';
import { clsx } from 'clsx';

// ── Extended mock data for admin analytics ───────────────────────────────────

const stats = getPlatformStats();
const revenueData = getRevenueData();

// 90-day call volume + revenue trend
const dailyTrend = Array.from({ length: 90 }, (_, i) => {
    const d = subDays(new Date(), 89 - i);
    const isWeekend = [0, 6].includes(d.getDay());
    const base = isWeekend ? 280 : 480;
    return {
        date: format(d, 'MMM d'),
        calls: Math.floor(base + Math.random() * 200 - 50),
        minutes: Math.floor((base + Math.random() * 200) * 2.4),
        cost: +((base + Math.random() * 150) * 0.012).toFixed(2),
        users: Math.floor(40 + Math.random() * 20),
    };
});

// User growth (monthly)
const userGrowth = Array.from({ length: 12 }, (_, i) => {
    const d = subDays(new Date(), (11 - i) * 30);
    return {
        month: format(d, 'MMM yy'),
        total: 20 + i * 8 + Math.floor(Math.random() * 5),
        new: Math.floor(8 + Math.random() * 6),
        churned: Math.floor(Math.random() * 3),
    };
});

// Plan revenue breakdown
const planRevenue = [
    { plan: 'Free', users: stats.planBreakdown.free, mrr: 0, color: '#71717a' },
    { plan: 'Starter', users: stats.planBreakdown.starter, mrr: stats.planBreakdown.starter * 29, color: '#6366f1' },
    { plan: 'Growth', users: stats.planBreakdown.growth, mrr: stats.planBreakdown.growth * 99, color: '#22c55e' },
    { plan: 'Enterprise', users: stats.planBreakdown.enterprise, mrr: stats.planBreakdown.enterprise * 499, color: '#f59e0b' },
];

// Top orgs by revenue
const topOrgs = [...mockAdminOrgs]
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 6)
    .map(o => ({ name: o.name.length > 18 ? o.name.slice(0, 18) + '…' : o.name, mrr: o.mrr, calls: o.calls }));

// Call outcome breakdown
const callOutcomes = [
    { name: 'Completed', value: mockAdminCalls.filter(c => c.status === 'ended').length, color: '#22c55e' },
    { name: 'Failed', value: mockAdminCalls.filter(c => c.status === 'failed').length, color: '#ef4444' },
    { name: 'Busy / No Answer', value: mockAdminCalls.filter(c => c.status === 'busy').length, color: '#f59e0b' },
];

// Hourly distribution
const hourlyDist = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    calls: Math.floor(h >= 9 && h <= 18 ? 30 + Math.random() * 50 : 5 + Math.random() * 15),
}));

// Direction split
const directionData = [
    { name: 'Inbound', value: mockAdminCalls.filter(c => c.direction === 'inbound').length, color: '#6366f1' },
    { name: 'Outbound', value: mockAdminCalls.filter(c => c.direction === 'outbound').length, color: '#f59e0b' },
];

// Sentiment topics
const sentimentData = [
    { topic: 'Payment', pct: 28, csat: 61, calls: 1032, color: '#ef4444' },
    { topic: 'Billing', pct: 22, csat: 70, calls: 811, color: '#f59e0b' },
    { topic: 'Technical', pct: 18, csat: 74, calls: 663, color: '#6366f1' },
    { topic: 'General', pct: 15, csat: 88, calls: 553, color: '#22c55e' },
    { topic: 'Failed Calls', pct: 10, csat: 42, calls: 369, color: '#dc2626' },
    { topic: 'Costly/Overcharge', pct: 7, csat: 55, calls: 258, color: '#8b5cf6' },
];

// Geographic distribution (simulated)
const geoData = [
    { region: 'North America', users: 4, calls: 12400, mrr: 1226, color: '#6366f1' },
    { region: 'Asia Pacific', users: 3, calls: 22440, mrr: 1027, color: '#22c55e' },
    { region: 'Europe', users: 2, calls: 1240, mrr: 128, color: '#f59e0b' },
    { region: 'Africa', users: 1, calls: 12800, mrr: 499, color: '#8b5cf6' },
];

// Assistant performance
const assistantPerf = [
    { name: 'Sales Qualifier', calls: 3200, successRate: 78, avgDur: 184, cost: 342 },
    { name: 'Support Agent', calls: 2800, successRate: 82, avgDur: 210, cost: 298 },
    { name: 'Booking Bot', calls: 2200, successRate: 91, avgDur: 97, cost: 145 },
    { name: 'Outbound Dialer', calls: 1900, successRate: 64, avgDur: 156, cost: 220 },
    { name: 'FAQ Bot', calls: 1700, successRate: 88, avgDur: 68, cost: 89 },
    { name: 'Lead Gen', calls: 1400, successRate: 71, avgDur: 201, cost: 189 },
];

const PRESETS = ['7d', '30d', '90d'];

// ── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon: Icon, color, trend, trendUp }: any) {
    return (
        <div className="card p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
                {trend && (
                    <div className={clsx('flex items-center gap-0.5 text-[11px] font-medium', trendUp ? 'text-emerald-400' : 'text-red-400')}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{title}</p>
            {sub && <p className="text-[10px] text-text-muted mt-1 border-t border-border pt-1">{sub}</p>}
        </div>
    );
}

function SectionHeader({ icon: Icon, title, sub }: any) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-600/10">
                <Icon className="w-4 h-4 text-rose-400" />
            </div>
            <div>
                <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
                {sub && <p className="text-xs text-text-muted">{sub}</p>}
            </div>
        </div>
    );
}

const TT = { contentStyle: { background: '#111', border: '1px solid #333', borderRadius: 8, fontSize: 11 } };

// ── Main Page ─────────────────────────────────────────────────────────────────
export function AdminAnalyticsPage() {
    const [preset, setPreset] = useState('30d');
    const slicedTrend = preset === '7d' ? dailyTrend.slice(-7) : preset === '30d' ? dailyTrend.slice(-30) : dailyTrend;
    const totalCalls = mockAdminCalls.length;
    const avgDur = Math.round(mockAdminCalls.reduce((a, c) => a + c.duration, 0) / totalCalls);
    const totalRevenue = mockAdminUsers.reduce((a, u) => a + u.totalCost, 0);
    const successCalls = mockAdminCalls.filter(c => c.status === 'ended').length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Platform Analytics</h1>
                    <p className="text-xs text-text-muted">Full platform telemetry — all users, orgs, calls and revenue</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border border-rose-900/40 rounded-lg overflow-hidden">
                        {PRESETS.map(p => (
                            <button key={p} onClick={() => setPreset(p)}
                                className={clsx('px-3 py-1.5 text-xs font-medium transition-colors',
                                    preset === p ? 'bg-rose-600/20 text-rose-400' : 'text-rose-200/50 hover:text-rose-200')}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-rose-900/40 text-rose-300/60 hover:text-rose-200 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <KpiCard title="Total Users" value={stats.totalUsers} icon={Users} color="#6366f1" trend="+18%" trendUp sub={`${stats.activeUsers} active`} />
                <KpiCard title="Platform MRR" value={`$${stats.totalMRR.toLocaleString()}`} icon={DollarSign} color="#22c55e" trend="+12%" trendUp sub={`ARR $${(stats.totalMRR * 12).toLocaleString()}`} />
                <KpiCard title="Total Calls" value={stats.totalCalls.toLocaleString()} icon={PhoneCall} color="#f59e0b" trend="+24%" trendUp sub="All time" />
                <KpiCard title="Assistants" value={stats.totalAssistants} icon={Bot} color="#8b5cf6" trend="+9" trendUp sub="Across all orgs" />
                <KpiCard title="Avg Call Duration" value={`${stats.avgCallDuration}s`} icon={Clock} color="#10b981" sub="Per completed call" />
                <KpiCard title="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} icon={BarChart2} color="#ec4899" trend="+31%" trendUp sub="All time usage" />
            </div>

            {/* ── Call Volume Trend ── */}
            <div>
                <SectionHeader icon={PhoneCall} title="Call & Usage Trends" sub="Platform-wide call volume, minutes and cost over time" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="card p-4 xl:col-span-2">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Call Volume & Minutes</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={slicedTrend} margin={{ left: -20 }}>
                                <defs>
                                    <linearGradient id="acalls" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="amins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} interval={Math.floor(slicedTrend.length / 7)} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <Tooltip {...TT} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Area type="monotone" dataKey="calls" name="Calls" stroke="#6366f1" fill="url(#acalls)" strokeWidth={1.5} dot={false} />
                                <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#22c55e" fill="url(#amins)" strokeWidth={1.5} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Daily Cost ($)</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={slicedTrend} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} interval={Math.floor(slicedTrend.length / 5)} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <Tooltip {...TT} formatter={(v: any) => [`$${v}`]} />
                                <Line type="monotone" dataKey="cost" name="Cost" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Revenue & Growth ── */}
            <div>
                <SectionHeader icon={DollarSign} title="Revenue & User Growth" sub="MRR, expansion, churn and new user acquisition over 12 months" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">MRR Breakdown (6 months)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={revenueData} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip {...TT} formatter={(v: any) => [`$${v}`]} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="mrr" name="MRR" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="newRevenue" name="New" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="churn" name="Churn" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">User Growth (12 months)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={userGrowth} margin={{ left: -20 }}>
                                <defs>
                                    <linearGradient id="ug1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <Tooltip {...TT} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Area type="monotone" dataKey="total" name="Total Users" stroke="#6366f1" fill="url(#ug1)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="new" name="New" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Plan Distribution + Top Orgs ── */}
            <div>
                <SectionHeader icon={Users} title="Plan & Organization Analytics" sub="Revenue per plan tier and top revenue-generating organizations" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Plan donut */}
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-1">Plan Distribution</h3>
                        <p className="text-[10px] text-text-muted mb-2">Users per plan</p>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={planRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="users" strokeWidth={0} paddingAngle={2}>
                                    {planRevenue.map((p, i) => <Cell key={i} fill={p.color} />)}
                                </Pie>
                                <Tooltip {...TT} formatter={(v: any, name) => [v, 'Users']} />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                            {planRevenue.map(p => (
                                <div key={p.plan} className="flex items-center justify-between px-2 py-1 rounded bg-white/[0.03]">
                                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                                        {p.plan}
                                    </span>
                                    <span className="text-[10px] font-semibold text-text-primary">${p.mrr}/mo</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top orgs bar */}
                    <div className="card p-4 xl:col-span-2">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Top Organizations by MRR</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={topOrgs} layout="vertical" margin={{ left: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} tickLine={false} axisLine={false} width={100} />
                                <Tooltip {...TT} formatter={(v: any, name) => [name === 'mrr' ? `$${v}/mo` : v, name === 'mrr' ? 'MRR' : 'Calls']} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="mrr" name="MRR ($)" fill="#22c55e" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="calls" name="Calls" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Call Quality ── */}
            <div>
                <SectionHeader icon={PhoneCall} title="Call Quality & Patterns" sub="Outcomes, direction split, hourly distribution and regional breakdown" />
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                    {/* Outcomes donut */}
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Call Outcomes</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={callOutcomes} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                                    {callOutcomes.map((c, i) => <Cell key={i} fill={c.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11, color: '#111' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1 mt-1">
                            {callOutcomes.map(c => (
                                <div key={c.name} className="flex items-center justify-between text-[10px]">
                                    <span className="flex items-center gap-1 text-text-muted">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                        {c.name}
                                    </span>
                                    <span className="font-semibold text-text-primary">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hourly dist bar */}
                    <div className="card p-4 xl:col-span-2">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Calls by Hour (UTC)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={hourlyDist} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="hour" tick={{ fill: '#71717a', fontSize: 8 }} tickLine={false} axisLine={false} interval={3} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <Tooltip {...TT} />
                                <Bar dataKey="calls" fill="#6366f1" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Direction + geo */}
                    <div className="space-y-4">
                        <div className="card p-4">
                            <h3 className="text-xs font-semibold text-text-primary mb-2">Inbound vs Outbound</h3>
                            {directionData.map(d => (
                                <div key={d.name} className="mb-2">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-text-muted">{d.name}</span>
                                        <span className="font-semibold" style={{ color: d.color }}>{d.value}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full">
                                        <div className="h-full rounded-full" style={{ width: `${(d.value / totalCalls) * 100}%`, backgroundColor: d.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card p-4">
                            <h3 className="text-xs font-semibold text-text-primary mb-2">Success Rate</h3>
                            <p className="text-3xl font-bold text-emerald-400">{((successCalls / totalCalls) * 100).toFixed(1)}%</p>
                            <p className="text-[10px] text-text-muted mt-1">{successCalls} of {totalCalls} calls completed</p>
                            <div className="mt-2 h-1.5 bg-white/5 rounded-full">
                                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(successCalls / totalCalls) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Assistant Performance ── */}
            <div>
                <SectionHeader icon={Bot} title="Assistant Performance" sub="Call volume, success rate, average duration and cost per assistant type" />
                <div className="card p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border text-text-muted">
                                    <th className="text-left pb-2 font-medium">Assistant Type</th>
                                    <th className="text-right pb-2 font-medium">Total Calls</th>
                                    <th className="text-right pb-2 font-medium">Success Rate</th>
                                    <th className="text-right pb-2 font-medium">Avg Duration</th>
                                    <th className="text-right pb-2 font-medium">Total Cost</th>
                                    <th className="pb-2 font-medium pl-4">Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assistantPerf.map(a => {
                                    const srColor = a.successRate >= 80 ? '#22c55e' : a.successRate >= 65 ? '#f59e0b' : '#ef4444';
                                    return (
                                        <tr key={a.name} className="border-b border-border/40 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-2.5 font-medium text-text-primary">{a.name}</td>
                                            <td className="py-2.5 text-right text-text-muted">{a.calls.toLocaleString()}</td>
                                            <td className="py-2.5 text-right font-bold" style={{ color: srColor }}>{a.successRate}%</td>
                                            <td className="py-2.5 text-right text-text-muted">{a.avgDur}s</td>
                                            <td className="py-2.5 text-right text-text-muted">${a.cost}</td>
                                            <td className="py-2.5 pl-4">
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full">
                                                    <div className="h-full rounded-full" style={{ width: `${a.successRate}%`, backgroundColor: srColor }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Geographic Distribution ── */}
            <div>
                <SectionHeader icon={Globe} title="Geographic Distribution" sub="Users, call volume and revenue by region" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">MRR by Region</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={geoData} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="region" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                <Tooltip {...TT} formatter={(v: any, name) => [name === 'mrr' ? `$${v}/mo` : v, name === 'mrr' ? 'MRR' : name === 'users' ? 'Users' : 'Calls']} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="mrr" name="MRR ($)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="calls" name="Calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Regional Breakdown</h3>
                        <div className="space-y-3">
                            {geoData.map(g => (
                                <div key={g.region}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-text-secondary flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                                            {g.region}
                                        </span>
                                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                                            <span>{g.users} users</span>
                                            <span>{g.calls.toLocaleString()} calls</span>
                                            <span className="font-semibold text-text-primary">${g.mrr}/mo</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full">
                                        <div className="h-full rounded-full" style={{ width: `${(g.calls / 25000) * 100}%`, backgroundColor: g.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Sentiment Analysis ── */}
            <div>
                <SectionHeader icon={Zap} title="Platform Sentiment Analysis" sub="Call intent and user sentiment across all organizations and assistants" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="card p-4">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Topic Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="pct" strokeWidth={0} paddingAngle={2}>
                                    {sentimentData.map((s, i) => <Cell key={i} fill={s.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11, color: '#111' }}
                                    formatter={(v: any) => [`${v}%`, 'Share']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4 xl:col-span-2">
                        <h3 className="text-xs font-semibold text-text-primary mb-3">Topic Summary with CSAT</h3>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border text-text-muted">
                                    <th className="text-left pb-2 font-medium">Topic</th>
                                    <th className="text-right pb-2 font-medium">Share</th>
                                    <th className="text-right pb-2 font-medium">Calls</th>
                                    <th className="text-right pb-2 font-medium">CSAT</th>
                                    <th className="pb-2 pl-4 font-medium">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sentimentData.map(s => {
                                    const csatColor = s.csat >= 75 ? '#22c55e' : s.csat >= 60 ? '#f59e0b' : '#ef4444';
                                    return (
                                        <tr key={s.topic} className="border-b border-border/40 hover:bg-white/[0.02]">
                                            <td className="py-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                                    <span className="text-text-secondary">{s.topic}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 text-right font-bold" style={{ color: s.color }}>{s.pct}%</td>
                                            <td className="py-2.5 text-right text-text-muted">{s.calls.toLocaleString()}</td>
                                            <td className="py-2.5 text-right font-bold" style={{ color: csatColor }}>{s.csat}%</td>
                                            <td className="py-2.5 pl-4">
                                                <div className="w-20 h-1.5 bg-white/5 rounded-full">
                                                    <div className="h-full rounded-full" style={{ width: `${s.pct * 3.2}%`, backgroundColor: s.color }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Alerts ── */}
            <div>
                <SectionHeader icon={AlertTriangle} title="Platform Alerts" sub="Issues and anomalies detected across the platform" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                    {[
                        { icon: AlertTriangle, color: '#ef4444', bg: '#ef444415', label: 'High Failure Rate', detail: 'CallCenter Pro: 14% failure rate (↑ from 6%)', time: '2h ago' },
                        { icon: TrendingDown, color: '#f59e0b', bg: '#f59e0b15', label: 'Churn Risk', detail: 'RealtyBot suspended — $99/mo at risk', time: '1d ago' },
                        { icon: CheckCircle, color: '#22c55e', bg: '#22c55e15', label: 'New Enterprise', detail: 'FinBot Africa upgraded to Enterprise', time: '3d ago' },
                    ].map((a, i) => (
                        <div key={i} className="card p-3 flex items-start gap-3" style={{ borderColor: a.color + '30' }}>
                            <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: a.bg }}>
                                <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-text-primary">{a.label}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">{a.detail}</p>
                                <p className="text-[10px] text-text-muted/50 mt-1">{a.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
