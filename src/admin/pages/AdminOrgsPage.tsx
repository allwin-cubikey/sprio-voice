import React, { useState } from 'react';
import { Search, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { mockAdminOrgs, AdminOrg } from '../adminMockData';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const planColors: Record<string, string> = {
    free: 'bg-zinc-700/40 text-zinc-300',
    starter: 'bg-sky-900/40 text-sky-300',
    growth: 'bg-violet-900/40 text-violet-300',
    enterprise: 'bg-amber-900/40 text-amber-300',
};

function UsageBar({ used, limit }: { used: number; limit: number }) {
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-rose-900/30">
                <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-rose-200/40 w-8 text-right">{pct}%</span>
        </div>
    );
}

export function AdminOrgsPage() {
    const [orgs] = useState<AdminOrg[]>(mockAdminOrgs);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('all');

    const filtered = orgs.filter(o => {
        const q = search.toLowerCase();
        const matchQ = !q || o.name.toLowerCase().includes(q) || o.ownerEmail.toLowerCase().includes(q);
        return matchQ && (planFilter === 'all' || o.plan === planFilter);
    });

    const totalMRR = orgs.reduce((a, o) => a + o.mrr, 0);

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Organizations</h1>
                    <p className="text-sm text-rose-200/40 mt-0.5">{orgs.length} organizations · ${totalMRR.toLocaleString()} MRR</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-400">
                        {orgs.filter(o => o.status === 'active').length} Active
                    </span>
                    <span className="px-2 py-1 rounded-md bg-amber-900/30 border border-amber-700/30 text-amber-400">
                        {orgs.filter(o => o.status === 'suspended').length} Suspended
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400/40" />
                    <input className="w-full bg-rose-950/30 border border-rose-900/30 text-rose-100 placeholder-rose-400/30 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-rose-600/50"
                        placeholder="Search organizations…" value={search} onChange={e => setSearch(e.target.value)} />
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
            </div>

            <div className="rounded-xl border border-rose-900/20 overflow-hidden" style={{ background: '#150a0a' }}>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-rose-900/30 text-rose-200/40">
                            <th className="text-left px-4 py-3 font-medium">Organization</th>
                            <th className="text-left px-4 py-3 font-medium">Plan</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-right px-4 py-3 font-medium">MRR</th>
                            <th className="text-right px-4 py-3 font-medium">Assistants</th>
                            <th className="text-right px-4 py-3 font-medium">Calls</th>
                            <th className="text-left px-4 py-3 font-medium w-40">Minutes Used</th>
                            <th className="text-right px-4 py-3 font-medium">Members</th>
                            <th className="text-left px-4 py-3 font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id} className="border-b border-rose-900/15 hover:bg-rose-900/10 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-rose-100">{o.name}</p>
                                    <p className="text-rose-200/40">{o.ownerEmail}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize', planColors[o.plan])}>{o.plan}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        {o.status === 'active'
                                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                            : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                                        <span className="capitalize text-rose-200/60">{o.status}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-emerald-400 font-semibold">
                                    {o.mrr > 0 ? `$${o.mrr}/mo` : <span className="text-rose-200/30">Free</span>}
                                </td>
                                <td className="px-4 py-3 text-right text-rose-200/70">{o.assistants}</td>
                                <td className="px-4 py-3 text-right text-rose-200/70">{o.calls.toLocaleString()}</td>
                                <td className="px-4 py-3 w-40">
                                    <UsageBar used={o.minutesUsed} limit={o.minutesLimit} />
                                    <p className="text-[10px] text-rose-200/30 mt-0.5">{o.minutesUsed.toLocaleString()} / {o.minutesLimit.toLocaleString()} min</p>
                                </td>
                                <td className="px-4 py-3 text-right text-rose-200/70">{o.members}</td>
                                <td className="px-4 py-3 text-rose-200/40">{format(new Date(o.joinedAt), 'MMM d, yyyy')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-rose-200/30 text-sm">No organizations found</div>
                )}
            </div>
        </div>
    );
}
