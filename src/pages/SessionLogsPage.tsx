import React, { useState, useMemo } from 'react';
import { Clock, Search, RefreshCw, Download, ChevronDown, X } from 'lucide-react';
import { useCallStore, useAssistantStore } from '@/store';
import { Badge, EmptyState } from '@/components/ui/index';
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { clsx } from 'clsx';

// Mock session data built from calls
function buildSessions(calls: any[]) {
    return calls.slice(0, 40).map(call => ({
        id: call.id,
        assistantId: call.assistantId,
        assistantName: call.assistantName,
        assistantPhoneNumber: call.toNumber,
        customerPhoneNumber: call.fromNumber,
        type: call.direction,
        endedReason: call.status === 'ended' ? 'call-ended-by-assistant' : call.status === 'failed' ? 'pipeline-error' : 'customer-ended-call',
        successEval: call.successEval,
        score: call.successEval === true ? 'pass' : call.successEval === false ? 'fail' : null,
        startTime: call.startedAt,
        duration: call.duration,
        cost: call.cost,
    }));
}

const CHIP_FILTERS = [
    'Date and Time', 'Cost', 'Call Type', 'Assistant', 'Transient Assistant Name',
    'Squad', 'Transient Squad Name', 'Assistant Phone Number', 'Customer Phone Number',
    'Call ID', 'Success Evaluation', 'Ended Reason', 'Metadata', 'Structured Outputs',
    'Score', 'Assistant Override Variable Values',
];

const TAB_FILTERS = ['All Calls', 'Transferred', 'Successful', 'Failed'];

export function SessionLogsPage() {
    const { calls } = useCallStore();
    const { assistants } = useAssistantStore();
    const [activeTab, setActiveTab] = useState('All Calls');
    const [search, setSearch] = useState('');
    const [activeChips, setActiveChips] = useState<Set<string>>(new Set(['Date and Time']));
    const [dateFrom] = useState(subDays(new Date(), 30));

    const sessions = useMemo(() => buildSessions(calls), [calls]);

    const filtered = useMemo(() => sessions.filter(s => {
        if (activeTab === 'Transferred') return s.endedReason === 'call-transferred';
        if (activeTab === 'Successful') return s.score === 'pass';
        if (activeTab === 'Failed') return s.score === 'fail';
        return true;
    }).filter(s =>
        search === '' || s.id.includes(search) || s.assistantName.toLowerCase().includes(search.toLowerCase())
    ), [sessions, activeTab, search]);

    const tabCounts = {
        'All Calls': sessions.length,
        'Transferred': sessions.filter(s => s.endedReason === 'call-transferred').length,
        'Successful': sessions.filter(s => s.score === 'pass').length,
        'Failed': sessions.filter(s => s.score === 'fail').length,
    };

    const toggleChip = (chip: string) => {
        setActiveChips(prev => {
            const s = new Set(prev);
            s.has(chip) ? s.delete(chip) : s.add(chip);
            return s;
        });
    };

    function fmtDur(s: number) {
        if (!s) return '—';
        const m = Math.floor(s / 60); const sec = s % 60;
        return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <Clock className="w-5 h-5 text-text-muted" />
                <div>
                    <h1 className="text-base font-semibold text-text-primary">Session Logs</h1>
                    <p className="text-xs text-text-muted">View and manage session conversations</p>
                </div>
            </div>

            {/* Tab filters */}
            <div className="flex items-center gap-0 border-b border-border -mb-px">
                {TAB_FILTERS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={clsx('flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px',
                            activeTab === tab
                                ? 'border-accent text-text-primary font-medium'
                                : 'border-transparent text-text-muted hover:text-text-primary')}>
                        {tab === 'All Calls' && <span className="w-3.5 h-3.5 text-xs opacity-70">≡</span>}
                        {tab === 'Transferred' && <span className="text-xs opacity-70">⇄</span>}
                        {tab === 'Successful' && <span className="text-xs text-success opacity-70">◎</span>}
                        {tab === 'Failed' && <span className="text-xs text-error opacity-70">⊗</span>}
                        {tab} <span className="text-xs text-text-muted">{tabCounts[tab as keyof typeof tabCounts]}</span>
                    </button>
                ))}
            </div>

            {/* Filter chips */}
            <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                    {CHIP_FILTERS.map(chip => (
                        <button key={chip} onClick={() => toggleChip(chip)}
                            className={clsx(
                                'flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-all',
                                activeChips.has(chip)
                                    ? chip === 'Date and Time'
                                        ? 'border-accent/70 bg-accent/10 text-accent'
                                        : 'border-white/30 bg-white/10 text-text-primary'
                                    : 'border-border text-text-muted hover:border-white/30 hover:text-text-primary'
                            )}>
                            {activeChips.has(chip) && <span className="text-accent">◎</span>}
                            {chip}
                            {chip === 'Date and Time' && (
                                <span className="text-[10px] text-accent ml-1 font-mono">
                                    Starting from {format(dateFrom, 'MM/dd/yyyy')}
                                </span>
                            )}
                            {activeChips.has(chip) && chip !== 'Date and Time' && (
                                <X className="w-3 h-3 opacity-50 hover:opacity-100" onClick={e => { e.stopPropagation(); toggleChip(chip); }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">Quick filters show counts for currently loaded results only.</p>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-white/5 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-white/5 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-text-muted gap-2">
                    <Clock className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No sessions found.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-8"><input type="checkbox" className="accent-accent" /></th>
                                <th>Call ID</th>
                                <th>Assistant / Squad</th>
                                <th>Asst. Phone Number</th>
                                <th>Customer Phone Number</th>
                                <th>Type</th>
                                <th>Ended Reason</th>
                                <th>Success Eval</th>
                                <th>Score</th>
                                <th className="cursor-pointer">Start Time ↓</th>
                                <th>Duration</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} className="cursor-pointer">
                                    <td onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="accent-accent" />
                                    </td>
                                    <td className="font-mono text-xs text-accent">{s.id}</td>
                                    <td className="text-sm">{s.assistantName}</td>
                                    <td className="font-mono text-xs text-text-muted">{s.assistantPhoneNumber}</td>
                                    <td className="font-mono text-xs text-text-muted">{s.customerPhoneNumber}</td>
                                    <td><Badge variant={s.type === 'inbound' ? 'blue' : 'purple'}>{s.type}</Badge></td>
                                    <td className="text-xs text-text-muted max-w-[140px] truncate">{s.endedReason}</td>
                                    <td>
                                        {s.successEval === true
                                            ? <span className="text-success text-sm">✓ true</span>
                                            : s.successEval === false
                                                ? <span className="text-error text-sm">✗ false</span>
                                                : <span className="text-text-muted text-sm">—</span>}
                                    </td>
                                    <td>
                                        {s.score === 'pass'
                                            ? <span className="badge-success text-[10px]">pass</span>
                                            : s.score === 'fail'
                                                ? <span className="badge-error text-[10px]">fail</span>
                                                : <span className="text-text-muted">—</span>}
                                    </td>
                                    <td className="text-xs text-text-muted">{format(new Date(s.startTime), 'MMM d, HH:mm')}</td>
                                    <td className="text-xs">{fmtDur(s.duration)}</td>
                                    <td className="font-mono text-xs">${s.cost.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
