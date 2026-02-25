import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Package, Calendar, ChevronDown } from 'lucide-react';
import { useCallStore, useAssistantStore } from '@/store';
import { generateAnalyticsData } from '@/data/mockData';
import { format, subDays, eachDayOfInterval, eachHourOfInterval, addHours } from 'date-fns';
import { clsx } from 'clsx';

const { days } = generateAnalyticsData();

type GroupBy = 'Days' | 'Hours' | 'Weeks';

function DateRangePicker({ value, onChange }: { value: [Date, Date]; onChange: (v: [Date, Date]) => void }) {
    const PRESETS = [
        { label: 'Last 7 days', range: [subDays(new Date(), 7), new Date()] as [Date, Date] },
        { label: 'Last 30 days', range: [subDays(new Date(), 30), new Date()] as [Date, Date] },
        { label: 'Last 90 days', range: [subDays(new Date(), 90), new Date()] as [Date, Date] },
    ];
    const [open, setOpen] = useState(false);
    const fmt = (d: Date) => format(d, 'MM/dd/yyyy');

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-input text-sm text-text-secondary hover:border-accent/50 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                {fmt(value[0])} – {fmt(value[1])}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            {open && (
                <div className="absolute top-10 left-0 z-20 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[180px]">
                    {PRESETS.map(p => (
                        <button key={p.label} onClick={() => { onChange(p.range); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-sm text-left text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors">
                            {p.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function AssistantFilter({ selected, onChange, options }: { selected: string; onChange: (v: string) => void; options: { id: string; name: string }[] }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-input text-sm text-text-secondary hover:border-accent/50 transition-colors">
                {selected === 'all' ? 'All Assistants' : options.find(o => o.id === selected)?.name || 'All Assistants'}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            {open && (
                <div className="absolute top-10 right-0 z-20 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[180px] max-h-52 overflow-y-auto">
                    <button onClick={() => { onChange('all'); setOpen(false); }}
                        className="w-full px-4 py-2.5 text-sm text-left text-text-secondary hover:bg-white/5">All Assistants</button>
                    {options.map(o => (
                        <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-sm text-left text-text-secondary hover:bg-white/5">{o.name}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

const METRICS_CONFIG = [
    { key: 'callMinutes', label: 'Call Minutes', color: '#6366f1' },
    { key: 'calls', label: 'Number of Calls', color: '#22c55e' },
    { key: 'cost', label: 'Cost ($)', color: '#8b5cf6' },
    { key: 'successRate', label: 'Success Rate (%)', color: '#f59e0b' },
    { key: 'avgDuration', label: 'Avg Duration (s)', color: '#06b6d4' },
];

export function MetricsPage() {
    const { calls } = useCallStore();
    const { assistants } = useAssistantStore();
    const [dateRange, setDateRange] = useState<[Date, Date]>([subDays(new Date(), 30), new Date()]);
    const [groupBy, setGroupBy] = useState<GroupBy>('Days');
    const [assistantFilter, setAssistantFilter] = useState('all');
    const [activeMetric, setActiveMetric] = useState('callMinutes');

    // Build grouped chart data
    const chartData = useMemo(() => {
        const filteredCalls = calls.filter(c => {
            const d = new Date(c.startedAt);
            return d >= dateRange[0] && d <= dateRange[1] &&
                (assistantFilter === 'all' || c.assistantId === assistantFilter);
        });

        if (filteredCalls.length === 0) return [];

        if (groupBy === 'Days') {
            return days.slice(-30).map(d => ({
                label: d.date,
                callMinutes: +(d.minutes / 60).toFixed(1),
                calls: d.calls,
                cost: +d.cost.toFixed(2),
                successRate: +(70 + Math.random() * 25).toFixed(1),
                avgDuration: Math.round(d.minutes * 60 / Math.max(1, d.calls)),
            }));
        }
        // Hours grouping (last 24h)
        return Array.from({ length: 24 }, (_, h) => ({
            label: `${h.toString().padStart(2, '0')}:00`,
            callMinutes: +(Math.random() * 30).toFixed(1),
            calls: Math.floor(Math.random() * 20),
            cost: +(Math.random() * 5).toFixed(2),
            successRate: +(70 + Math.random() * 25).toFixed(1),
            avgDuration: Math.round(60 + Math.random() * 120),
        }));
    }, [calls, dateRange, groupBy, assistantFilter]);

    const hasData = chartData.length > 0 && chartData.some(d => Number(d[activeMetric as keyof typeof d]) > 0);
    const metric = METRICS_CONFIG.find(m => m.key === activeMetric)!;

    // Summary stats
    const totalCalls = chartData.reduce((a, d) => a + d.calls, 0);
    const totalMinutes = chartData.reduce((a, d) => a + d.callMinutes, 0);
    const totalCost = chartData.reduce((a, d) => a + d.cost, 0);
    const avgSuccess = chartData.length > 0
        ? (chartData.reduce((a, d) => a + d.successRate, 0) / chartData.length).toFixed(1)
        : '0';

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-xl font-bold text-text-primary">Metrics</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <div className="flex items-center gap-1 bg-card border border-border rounded-input px-1 py-1">
                        <span className="text-xs text-text-muted px-2">grouped by</span>
                        {(['Days', 'Hours', 'Weeks'] as GroupBy[]).map(g => (
                            <button key={g} onClick={() => setGroupBy(g)}
                                className={clsx('px-3 py-1 rounded text-xs font-medium transition-colors',
                                    groupBy === g ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary')}>
                                {g}
                            </button>
                        ))}
                    </div>
                    <AssistantFilter selected={assistantFilter} onChange={setAssistantFilter} options={assistants.map(a => ({ id: a.id, name: a.name }))} />
                </div>
            </div>

            {!hasData ? (
                <div className="flex flex-col items-center justify-center py-32 text-text-muted gap-4">
                    <Package className="w-16 h-16 opacity-20" strokeWidth={1} />
                    <p className="text-lg font-medium text-text-secondary">No data here</p>
                    <p className="text-sm text-text-muted">Please expand your date range or make some calls to start seeing metrics.</p>
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Calls', value: totalCalls.toLocaleString() },
                            { label: 'Total Minutes', value: totalMinutes.toFixed(1) },
                            { label: 'Total Cost', value: `$${totalCost.toFixed(2)}` },
                            { label: 'Avg Success Rate', value: `${avgSuccess}%` },
                        ].map(({ label, value }) => (
                            <div key={label} className="card px-4 py-3">
                                <p className="text-xs text-text-muted">{label}</p>
                                <p className="text-xl font-bold text-text-primary mt-1">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Metric selector */}
                    <div className="flex flex-wrap gap-2">
                        {METRICS_CONFIG.map(m => (
                            <button key={m.key} onClick={() => setActiveMetric(m.key)}
                                className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                    activeMetric === m.key
                                        ? 'text-white border-transparent'
                                        : 'border-border text-text-muted hover:border-white/30')}
                                style={activeMetric === m.key ? { backgroundColor: m.color, borderColor: m.color } : {}}>
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Main chart */}
                    <div className="card p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-text-primary">{metric.label}</h3>
                            <span className="text-xs text-text-muted">
                                {format(dateRange[0], 'MMM d')} – {format(dateRange[1], 'MMM d, yyyy')} · Grouped by {groupBy}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ left: -20 }}>
                                <defs>
                                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false}
                                    interval={groupBy === 'Hours' ? 3 : Math.floor(chartData.length / 8)} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                                    formatter={(v: any) => [
                                        activeMetric === 'cost' ? `$${Number(v).toFixed(2)}`
                                            : activeMetric === 'successRate' ? `${v}%`
                                                : v,
                                        metric.label
                                    ]}
                                />
                                <Area type="monotone" dataKey={activeMetric} stroke={metric.color} strokeWidth={2}
                                    fill="url(#mg)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Secondary breakdown charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="card p-4">
                            <h3 className="text-sm font-semibold text-text-primary mb-4">Calls vs Cost Comparison</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData.slice(-14)} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                                    <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="l" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="r" orientation="right" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
                                    <Bar yAxisId="l" dataKey="calls" fill="#6366f1" radius={[2, 2, 0, 0]} name="Calls" />
                                    <Bar yAxisId="r" dataKey="cost" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Cost ($)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="card p-4">
                            <h3 className="text-sm font-semibold text-text-primary mb-4">Success Rate Over Time</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData.slice(-14)} margin={{ left: -20 }}>
                                    <defs>
                                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                                    <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
                                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} formatter={v => [`${v}%`, 'Success Rate']} />
                                    <Area type="monotone" dataKey="successRate" stroke="#22c55e" strokeWidth={2} fill="url(#sg)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
