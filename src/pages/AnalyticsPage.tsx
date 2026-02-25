import React, { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, TrendingUp, Clock, PhoneCall, DollarSign, CheckCircle } from 'lucide-react';
import { generateAnalyticsData } from '@/data/mockData';
import { useCallStore, useAssistantStore } from '@/store';
import { clsx } from 'clsx';

const { days, hourlyData } = generateAnalyticsData();
const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

const PRESETS = ['Today', '7 days', '30 days', '90 days'];

function KpiCard({ title, value, icon: Icon, color, sub }: any) {
    return (
        <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm text-text-muted">{title}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
        </div>
    );
}

// Heatmap grid: 24 hours × 7 days
function HeatmapGrid() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxVal = Math.max(...hourlyData.map(d => d.value));

    return (
        <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Calls by Hour of Day</h3>
            <div className="overflow-x-auto">
                <div className="flex gap-1 mb-1">
                    <div className="w-10" />
                    {Array.from({ length: 24 }, (_, h) => (
                        <div key={h} className="w-6 text-center text-[9px] text-text-muted">{h % 6 === 0 ? `${h}h` : ''}</div>
                    ))}
                </div>
                {days.map((day, dayIdx) => (
                    <div key={day} className="flex items-center gap-1 mb-1">
                        <div className="w-10 text-[10px] text-text-muted text-right pr-2">{day}</div>
                        {Array.from({ length: 24 }, (_, hourIdx) => {
                            const cell = hourlyData.find(d => d.day === dayIdx && d.hour === hourIdx);
                            const intensity = cell ? cell.value / maxVal : 0;
                            return (
                                <div key={hourIdx} className="w-6 h-5 rounded-sm" title={`${day} ${hourIdx}:00 — ${cell?.value || 0} calls`}
                                    style={{ backgroundColor: `rgba(99,102,241,${intensity * 0.8 + 0.05})` }} />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnalyticsPage() {
    const { calls } = useCallStore();
    const { assistants } = useAssistantStore();
    const [preset, setPreset] = useState('30 days');

    const totalMinutes = Math.round(calls.reduce((a, c) => a + c.duration / 60, 0));
    const avgDuration = Math.round(calls.filter(c => c.duration > 0).reduce((a, c) => a + c.duration, 0) / Math.max(1, calls.filter(c => c.duration > 0).length));
    const successRate = +(calls.filter(c => c.successEval === true).length / Math.max(1, calls.filter(c => c.successEval !== undefined).length) * 100).toFixed(1);
    const totalCost = calls.reduce((a, c) => a + c.cost, 0);

    const pieData = [
        { name: 'Ended', value: calls.filter(c => c.status === 'ended').length },
        { name: 'Failed', value: calls.filter(c => c.status === 'failed').length },
        { name: 'No Answer', value: calls.filter(c => c.status === 'no-answer' || c.status === 'busy').length },
    ];

    const byAssistant = assistants.map(a => ({
        name: a.name.length > 16 ? a.name.slice(0, 16) + '…' : a.name,
        calls: a.callCount,
    })).sort((a, b) => b.calls - a.calls).slice(0, 6);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
                    <p className="text-sm text-text-muted">Call performance and usage insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border border-border rounded-input overflow-hidden">
                        {PRESETS.map(p => (
                            <button key={p} onClick={() => setPreset(p)}
                                className={clsx('px-3 py-1.5 text-xs font-medium transition-colors', preset === p ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary')}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                <KpiCard title="Total Calls" value={calls.length.toLocaleString()} icon={PhoneCall} color="#6366f1" sub="+12% vs prior period" />
                <KpiCard title="Total Minutes" value={totalMinutes.toLocaleString()} icon={Clock} color="#22c55e" sub="+8% vs prior period" />
                <KpiCard title="Avg Duration" value={`${avgDuration}s`} icon={TrendingUp} color="#f59e0b" sub="Per completed call" />
                <KpiCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle} color="#10b981" sub="Of evaluated calls" />
                <KpiCard title="Total Cost" value={`$${totalCost.toFixed(2)}`} icon={DollarSign} color="#8b5cf6" sub="This period" />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="card p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Call Volume Over Time</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={days} margin={{ left: -20 }}>
                            <defs>
                                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                            <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fill="url(#ag2)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="card p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Cost Over Time</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={days} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} formatter={v => [`$${(v as number).toFixed(2)}`]} />
                            <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="card p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Call Outcome Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="card p-4 xl:col-span-2">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">Calls by Assistant</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={byAssistant} layout="vertical" margin={{ left: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                            <Bar dataKey="calls" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <HeatmapGrid />
        </div>
    );
}
