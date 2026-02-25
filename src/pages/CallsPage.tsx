import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, Copy, Play, Pause, Download, ChevronDown } from 'lucide-react';
import { useCallStore } from '@/store';
import { Badge, EmptyState, CopyButton, WaveformVisualizer } from '@/components/ui/index';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── Call Status Badge ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, any> = {
        ended: { variant: 'success', label: 'Ended' },
        failed: { variant: 'error', label: 'Failed' },
        busy: { variant: 'warning', label: 'Busy' },
        'no-answer': { variant: 'gray', label: 'No Answer' },
        'in-progress': { variant: 'blue', label: 'Live' },
    };
    const { variant, label } = map[status] || { variant: 'gray', label: status };
    return <Badge variant={variant}>{label}</Badge>;
}

function fmtDur(s: number) {
    if (!s) return '—';
    const m = Math.floor(s / 60); const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ── Call Logs List ────────────────────────────────────────────────────────────
export function CallLogsPage() {
    const { calls } = useCallStore();
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('all');
    const [directionF, setDirectionF] = useState('all');
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    const filtered = useMemo(() => calls.filter(c => {
        const q = search.toLowerCase();
        return (
            (c.id.includes(q) || c.assistantName.toLowerCase().includes(q) || c.fromNumber.includes(q) || c.toNumber.includes(q)) &&
            (statusF === 'all' || c.status === statusF) &&
            (directionF === 'all' || c.direction === directionF)
        );
    }), [calls, search, statusF, directionF]);

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Call Logs</h1>
                    <p className="text-sm text-text-muted">{filtered.length} calls found</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input className="input pl-9 w-64" placeholder="Search calls..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select className="input w-36" value={statusF} onChange={e => setStatusF(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="ended">Ended</option>
                    <option value="failed">Failed</option>
                    <option value="busy">Busy</option>
                    <option value="no-answer">No Answer</option>
                </select>
                <select className="input w-36" value={directionF} onChange={e => setDirectionF(e.target.value)}>
                    <option value="all">All Directions</option>
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Call ID</th><th>Direction</th><th>Assistant</th><th>From</th><th>To</th><th>Duration</th><th>Status</th><th>Cost</th><th>Started</th></tr></thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={9} className="text-center py-12 text-text-muted">No calls match your filters</td></tr>
                        ) : paginated.map(call => (
                            <tr key={call.id} className="cursor-pointer">
                                <td>
                                    <div className="flex items-center gap-1.5">
                                        <Link to={`/calls/${call.id}`} className="font-mono text-xs text-accent hover:underline">{call.id.slice(0, 14)}...</Link>
                                        <CopyButton value={call.id} />
                                    </div>
                                </td>
                                <td><Badge variant={call.direction === 'inbound' ? 'blue' : 'purple'}>{call.direction}</Badge></td>
                                <td className="text-text-primary font-medium">{call.assistantName}</td>
                                <td className="font-mono text-xs">{call.fromNumber}</td>
                                <td className="font-mono text-xs">{call.toNumber}</td>
                                <td>{fmtDur(call.duration)}</td>
                                <td><StatusBadge status={call.status} /></td>
                                <td className="font-mono text-xs">${call.cost.toFixed(4)}</td>
                                <td className="text-text-muted text-xs">{format(new Date(call.startedAt), 'MMM d, HH:mm')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-3 disabled:opacity-50">Previous</button>
                        <span className="text-text-primary px-2">{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-3 disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Call Detail Page ──────────────────────────────────────────────────────────
const DETAIL_TABS = ['Transcript', 'Analysis', 'Timeline', 'Technical'];

export function CallDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { calls } = useCallStore();
    const call = calls.find(c => c.id === id);
    const [activeTab, setActiveTab] = useState(0);
    const [playing, setPlaying] = useState(false);

    if (!call) return (
        <div className="text-center py-16">
            <p className="text-text-muted">Call not found</p>
            <button onClick={() => navigate('/calls')} className="btn-secondary mt-4">Back to Calls</button>
        </div>
    );

    const latencyData = [
        { name: 'STT', ms: call.latency.stt, color: '#22c55e' },
        { name: 'LLM', ms: call.latency.llm, color: '#6366f1' },
        { name: 'TTS', ms: call.latency.tts, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-5 max-w-5xl">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/calls')} className="text-text-muted hover:text-text-primary">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-text-primary font-mono">{call.id}</h1>
                    <p className="text-xs text-text-muted">{format(new Date(call.startedAt), 'PPpp')}</p>
                </div>
            </div>

            {/* Metadata Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Direction', value: <Badge variant={call.direction === 'inbound' ? 'blue' : 'purple'}>{call.direction}</Badge> },
                    { label: 'Status', value: <StatusBadge status={call.status} /> },
                    { label: 'Duration', value: fmtDur(call.duration) },
                    { label: 'Cost', value: `$${call.cost.toFixed(4)}` },
                    { label: 'From', value: call.fromNumber },
                    { label: 'To', value: call.toNumber },
                ].map(({ label, value }) => (
                    <div key={label} className="card px-3 py-2.5">
                        <p className="text-[10px] text-text-muted mb-1">{label}</p>
                        <p className="text-sm font-medium text-text-primary">{value}</p>
                    </div>
                ))}
            </div>

            {/* Audio Player */}
            {call.duration > 0 && (
                <div className="card p-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPlaying(!playing)} className="p-2.5 rounded-full bg-accent hover:bg-accent-hover transition-colors text-white">
                            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <WaveformVisualizer active={playing} bars={40} className="flex-1" color="#6366f1" />
                        <span className="font-mono text-xs text-text-muted">{fmtDur(call.duration)}</span>
                        <button className="text-text-muted hover:text-text-primary transition-colors"><Download className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tab-nav">
                {DETAIL_TABS.map((t, i) => (
                    <button key={t} onClick={() => setActiveTab(i)} className={`tab-btn ${activeTab === i ? 'active' : ''}`}>{t}</button>
                ))}
            </div>

            {/* Tab: Transcript */}
            {activeTab === 0 && (
                <div className="card p-4 space-y-3 max-h-[500px] overflow-y-auto">
                    {call.transcript.length === 0 ? (
                        <p className="text-text-muted text-center py-8">No transcript available for this call.</p>
                    ) : call.transcript.map((entry) => (
                        <div key={entry.id} className={clsx('flex gap-3', entry.speaker === 'user' && 'flex-row-reverse')}>
                            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold',
                                entry.speaker === 'assistant' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-primary')}>
                                {entry.speaker === 'assistant' ? 'AI' : 'U'}
                            </div>
                            <div className={clsx('max-w-[75%] space-y-1', entry.speaker === 'user' && 'items-end flex flex-col')}>
                                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                    <span>{entry.speaker === 'assistant' ? call.assistantName : 'User'}</span>
                                    <span>+{entry.timestamp}s</span>
                                    {entry.sentiment && (
                                        <span className={clsx('px-1 rounded', entry.sentiment === 'positive' ? 'text-success' : entry.sentiment === 'negative' ? 'text-error' : 'text-text-muted')}>
                                            {entry.sentiment === 'positive' ? '😊' : entry.sentiment === 'negative' ? '😟' : '😐'}
                                        </span>
                                    )}
                                </div>
                                <div className={clsx('px-3 py-2 rounded-xl text-sm',
                                    entry.speaker === 'assistant' ? 'bg-accent/10 text-text-secondary' : 'bg-white/10 text-text-primary')}>
                                    {entry.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab: Analysis */}
            {activeTab === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="card p-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-2">Call Summary</h3>
                        <p className="text-sm text-text-secondary">{call.summary || 'No summary available.'}</p>
                    </div>
                    <div className="card p-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-2">Success Evaluation</h3>
                        {call.successEval !== undefined ? (
                            <div className={clsx('flex items-center gap-2 text-sm font-medium', call.successEval ? 'text-success' : 'text-error')}>
                                <span className="text-xl">{call.successEval ? '✅' : '❌'}</span>
                                {call.successEval ? 'Call was successful' : 'Call was not successful'}
                            </div>
                        ) : <p className="text-sm text-text-muted">Not evaluated</p>}
                    </div>
                    <div className="card p-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Cost Breakdown</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'LLM', cost: call.costBreakdown.llm, color: 'text-accent' },
                                { label: 'TTS', cost: call.costBreakdown.tts, color: 'text-warning' },
                                { label: 'STT', cost: call.costBreakdown.stt, color: 'text-success' },
                                { label: 'Telephony', cost: call.costBreakdown.telephony, color: 'text-text-secondary' },
                            ].map(({ label, cost, color }) => (
                                <div key={label} className="flex items-center justify-between text-sm">
                                    <span className={clsx('font-medium', color)}>{label}</span>
                                    <span className="font-mono text-text-secondary">${cost.toFixed(5)}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between text-sm border-t border-border pt-2 font-semibold">
                                <span className="text-text-primary">Total</span>
                                <span className="font-mono text-text-primary">${call.cost.toFixed(5)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Timeline */}
            {activeTab === 2 && (
                <div className="card p-4 space-y-0">
                    {[
                        { time: '0:00', event: 'Call initiated', type: 'start' },
                        { time: '0:04', event: `${call.assistantName} started speaking`, type: 'assistant' },
                        { time: '0:08', event: 'User started speaking', type: 'user' },
                        { time: '0:29', event: `${call.assistantName} responded`, type: 'assistant' },
                        ...(call.status === 'ended' ? [{ time: `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')}`, event: 'Call ended', type: 'end' }] : []),
                    ].map((item, i, arr) => (
                        <div key={i} className="flex gap-4 relative">
                            {i < arr.length - 1 && <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />}
                            <div className={clsx('w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 mt-1',
                                item.type === 'start' ? 'bg-success/20 border border-success/50' :
                                    item.type === 'end' ? 'bg-error/20 border border-error/50' :
                                        item.type === 'assistant' ? 'bg-accent/20 border border-accent/50' :
                                            'bg-white/10 border border-border')}>
                                <div className="w-2 h-2 rounded-full bg-current" />
                            </div>
                            <div className="pb-4">
                                <p className="text-sm text-text-primary">{item.event}</p>
                                <p className="text-xs text-text-muted">t={item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab: Technical */}
            {activeTab === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="card p-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">Latency Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={latencyData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} unit="ms" />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}ms`]} />
                                <Bar dataKey="ms" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {latencyData.map((d, i) => (
                                        <rect key={i} fill={d.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card p-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Technical Details</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Call ID', value: call.id },
                                { label: 'Assistant ID', value: call.assistantId },
                                { label: 'Started', value: format(new Date(call.startedAt), 'PPpp') },
                                { label: 'Ended', value: format(new Date(call.endedAt), 'PPpp') },
                                { label: 'LLM Latency', value: `${call.latency.llm}ms` },
                                { label: 'TTS Latency', value: `${call.latency.tts}ms` },
                                { label: 'STT Latency', value: `${call.latency.stt}ms` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between text-xs">
                                    <span className="text-text-muted">{label}</span>
                                    <span className="font-mono text-text-secondary">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
