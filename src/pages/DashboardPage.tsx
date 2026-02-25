import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PhoneCall, Clock, Bot, Phone, Plus, ExternalLink, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useCallStore, useAssistantStore, usePhoneNumberStore } from '@/store';
import { generateAnalyticsData } from '@/data/mockData';
import { format } from 'date-fns';
import { Badge, Skeleton } from '@/components/ui/index';
import { clsx } from 'clsx';


function SparklineChart({ data, color }: { data: number[]; color: string }) {
    const chartItems = data.map((v, i) => ({ v }));
    return (
        <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={chartItems} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color})`} dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, sparkData, color }: any) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-text-muted mb-1">{title}</p>
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                    {change && (
                        <div className={clsx('flex items-center gap-1 text-xs mt-1',
                            trend === 'up' ? 'text-success' : 'text-error')}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {change}
                        </div>
                    )}
                </div>
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
            <SparklineChart data={sparkData} color={color} />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { variant: any; label: string }> = {
        ended: { variant: 'success', label: 'Ended' },
        failed: { variant: 'error', label: 'Failed' },
        busy: { variant: 'warning', label: 'Busy' },
        'no-answer': { variant: 'gray', label: 'No Answer' },
        'in-progress': { variant: 'blue', label: 'Live' },
    };
    const { variant, label } = map[status] || { variant: 'gray', label: status };
    return <Badge variant={variant}>{label}</Badge>;
}

export function DashboardPage() {
    const { calls, loading } = useCallStore();
    const { assistants } = useAssistantStore();
    const { phoneNumbers } = usePhoneNumberStore();

    const { chartData, stats, sparkData, minuteSpark } = useMemo(() => {
        const { days } = generateAnalyticsData();
        const totalMinutes = calls.reduce((a, c) => a + Math.floor(c.duration / 60), 0);
        const activeAssistants = assistants.filter(a => a.status === 'active').length;
        const activeNumbers = phoneNumbers.filter(p => p.status === 'active').length;
        const totalCost = calls.reduce((a, c) => a + c.cost, 0);
        const durationCalls = calls.filter(c => c.duration > 0);
        const avgDuration = durationCalls.length > 0
            ? Math.round(durationCalls.reduce((a, c) => a + c.duration, 0) / durationCalls.length)
            : 0;
        return {
            chartData: days,
            stats: { totalCalls: calls.length, totalMinutes, activeAssistants, activeNumbers, totalCost, avgDuration },
            sparkData: days.slice(-10).map(d => d.calls),
            minuteSpark: days.slice(-10).map(d => d.minutes),
        };
    }, [calls, assistants, phoneNumbers]);

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            <div className="card px-4 py-3 flex items-center gap-3 border-green-800/30 bg-success/5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-text-secondary">All systems operational — No incidents</span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Calls" value={stats.totalCalls.toLocaleString()} change="+12.4% vs last month" trend="up" icon={PhoneCall} sparkData={sparkData} color="#6366f1" />
                <StatCard title="Minutes Used" value={`${stats.totalMinutes.toLocaleString()}`} change="+8.1% vs last month" trend="up" icon={Clock} sparkData={minuteSpark} color="#22c55e" />
                <StatCard title="Active Assistants" value={stats.activeAssistants} change="+1 this week" trend="up" icon={Bot} sparkData={[3, 3, 4, 4, 5, 5, 5, 5, 6, 6]} color="#f59e0b" />
                <StatCard title="Phone Numbers" value={stats.activeNumbers} change="No change" trend="neutral" icon={Phone} sparkData={[3, 3, 3, 3, 3, 3, 3, 3, 3, 3]} color="#8b5cf6" />
            </div>

            {/* Charts + Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Call Volume Chart */}
                <div className="card p-5 xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">Call Volume</h3>
                            <p className="text-xs text-text-muted">Last 30 days</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="minsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#f5f5f5' }} itemStyle={{ color: '#71717a' }} />
                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                            <Area type="monotone" dataKey="calls" name="Calls" stroke="#6366f1" strokeWidth={2} fill="url(#callsGrad)" dot={false} />
                            <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#22c55e" strokeWidth={2} fill="url(#minsGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions */}
                <div className="card p-5 flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
                    <Link to="/assistants/new" className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors group">
                        <div className="p-2 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors">
                            <Plus className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Create Assistant</p>
                            <p className="text-xs text-text-muted">Build a new voice agent</p>
                        </div>
                    </Link>
                    <Link to="/phone-numbers" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-border hover:border-accent/30 transition-colors group">
                        <div className="p-2 rounded-lg bg-white/10 group-hover:bg-accent/10 transition-colors">
                            <Phone className="w-4 h-4 text-text-muted group-hover:text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Buy Phone Number</p>
                            <p className="text-xs text-text-muted">Get a new number from $2/mo</p>
                        </div>
                    </Link>
                    <Link to="/docs" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-border hover:border-accent/30 transition-colors group">
                        <div className="p-2 rounded-lg bg-white/10 group-hover:bg-accent/10 transition-colors">
                            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">View API Docs</p>
                            <p className="text-xs text-text-muted">Start building with our API</p>
                        </div>
                    </Link>

                    {/* Mini stats */}
                    <div className="mt-auto pt-3 border-t border-border space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">This month's cost</span>
                            <span className="text-text-primary font-medium">${stats.totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Success rate</span>
                            <span className="text-success font-medium">87.3%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">Avg duration</span>
                            <span className="text-text-primary font-medium">{stats.avgDuration}s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Calls Table */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary">Recent Calls</h3>
                        <p className="text-xs text-text-muted">Latest call activity across all assistants</p>
                    </div>
                    <Link to="/calls" className="text-xs text-accent hover:underline">View all calls →</Link>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Call ID</th>
                                <th>Assistant</th>
                                <th>Direction</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Cost</th>
                                <th>Started At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j}><Skeleton className="h-4 w-full" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                calls.slice(0, 10).map(call => (
                                    <tr key={call.id} className="cursor-pointer">
                                        <td>
                                            <Link to={`/calls/${call.id}`} className="font-mono text-xs text-accent hover:underline">
                                                {call.id}
                                            </Link>
                                        </td>
                                        <td className="text-text-primary">{call.assistantName}</td>
                                        <td>
                                            <Badge variant={call.direction === 'inbound' ? 'blue' : 'purple'}>
                                                {call.direction}
                                            </Badge>
                                        </td>
                                        <td>{call.duration > 0 ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : '—'}</td>
                                        <td><StatusBadge status={call.status} /></td>
                                        <td className="font-mono text-xs">${call.cost.toFixed(4)}</td>
                                        <td className="text-text-muted text-xs">{format(new Date(call.startedAt), 'MMM d, HH:mm')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
