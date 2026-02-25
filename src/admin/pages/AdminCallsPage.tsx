import React, { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { mockAdminCalls, AdminCall } from '../adminMockData';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const statusColors: Record<string, string> = {
    ended: 'text-emerald-400',
    failed: 'text-red-400',
    busy: 'text-amber-400',
};

function fmt(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function AdminCallsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dirFilter, setDirFilter] = useState('all');
    const [sortDesc, setSortDesc] = useState(true);

    const filtered = mockAdminCalls
        .filter(c => {
            const q = search.toLowerCase();
            const matchQ = !q || c.orgName.toLowerCase().includes(q) || c.assistantName.toLowerCase().includes(q) || c.id.includes(q);
            return matchQ
                && (statusFilter === 'all' || c.status === statusFilter)
                && (dirFilter === 'all' || c.direction === dirFilter);
        })
        .sort((a, b) => sortDesc
            ? new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
            : new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );

    const totalCost = filtered.reduce((a, c) => a + c.cost, 0);
    const totalDuration = filtered.reduce((a, c) => a + c.duration, 0);
    const avgDuration = filtered.length ? Math.round(totalDuration / filtered.length) : 0;

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">All Calls</h1>
                    <p className="text-sm text-rose-200/40 mt-0.5">Cross-platform call logs — all organizations</p>
                </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Calls', value: filtered.length.toLocaleString() },
                    { label: 'Total Cost', value: `$${totalCost.toFixed(2)}` },
                    { label: 'Avg Duration', value: fmt(avgDuration) },
                    { label: 'Failed', value: filtered.filter(c => c.status === 'failed').length },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-rose-900/20 p-3" style={{ background: '#150a0a' }}>
                        <p className="text-[10px] text-rose-200/40 uppercase tracking-wide">{label}</p>
                        <p className="text-lg font-bold text-white mt-1">{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400/40" />
                    <input className="w-full bg-rose-950/30 border border-rose-900/30 text-rose-100 placeholder-rose-400/30 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-rose-600/50"
                        placeholder="Search org, assistant, call ID…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="bg-rose-950/30 border border-rose-900/30 text-rose-200/70 text-xs rounded-lg px-3 py-2 focus:outline-none">
                    <option value="all">All Statuses</option>
                    <option value="ended">Ended</option>
                    <option value="failed">Failed</option>
                    <option value="busy">Busy</option>
                </select>
                <select value={dirFilter} onChange={e => setDirFilter(e.target.value)}
                    className="bg-rose-950/30 border border-rose-900/30 text-rose-200/70 text-xs rounded-lg px-3 py-2 focus:outline-none">
                    <option value="all">All Directions</option>
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                </select>
                <button onClick={() => setSortDesc(!sortDesc)}
                    className="flex items-center gap-1.5 text-xs text-rose-200/60 border border-rose-900/30 rounded-lg px-3 py-2 hover:bg-rose-900/20 transition-colors">
                    <ArrowUpDown className="w-3 h-3" /> {sortDesc ? 'Newest first' : 'Oldest first'}
                </button>
            </div>

            <div className="rounded-xl border border-rose-900/20 overflow-hidden" style={{ background: '#150a0a' }}>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-rose-900/30 text-rose-200/40">
                            <th className="text-left px-4 py-3 font-medium">Call ID</th>
                            <th className="text-left px-4 py-3 font-medium">Organization</th>
                            <th className="text-left px-4 py-3 font-medium">Assistant</th>
                            <th className="text-left px-4 py-3 font-medium">Direction</th>
                            <th className="text-right px-4 py-3 font-medium">Duration</th>
                            <th className="text-right px-4 py-3 font-medium">Cost</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Started At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} className="border-b border-rose-900/15 hover:bg-rose-900/10 transition-colors">
                                <td className="px-4 py-3 font-mono text-rose-200/50">{c.id}</td>
                                <td className="px-4 py-3 text-rose-100">{c.orgName}</td>
                                <td className="px-4 py-3 text-rose-200/70">{c.assistantName}</td>
                                <td className="px-4 py-3">
                                    <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-semibold',
                                        c.direction === 'inbound' ? 'bg-sky-900/40 text-sky-300' : 'bg-violet-900/40 text-violet-300')}>
                                        {c.direction}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-rose-200/70">{fmt(c.duration)}</td>
                                <td className="px-4 py-3 text-right text-rose-200/70">${c.cost.toFixed(4)}</td>
                                <td className="px-4 py-3">
                                    <span className={clsx('capitalize font-medium', statusColors[c.status])}>{c.status}</span>
                                </td>
                                <td className="px-4 py-3 text-rose-200/40">{format(new Date(c.startedAt), 'MMM d, HH:mm')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-rose-200/30 text-sm">No calls match your filters</div>
                )}
            </div>
        </div>
    );
}
