import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Plus, Search, Grid3X3, List, MoreVertical, Edit, Copy, Trash2, PlayCircle } from 'lucide-react';
import { useAssistantStore, useToastStore } from '@/store';
import { Badge, EmptyState, ConfirmDialog } from '@/components/ui/index';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { Assistant } from '@/data/mockData';

function AssistantCard({ assistant, onEdit, onDuplicate, onDelete }: {
    assistant: Assistant; onEdit: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const providerColors: Record<string, string> = {
        openai: '#10b981', anthropic: '#f59e0b', together: '#8b5cf6', groq: '#6366f1', custom: '#71717a',
    };

    return (
        <div className="card p-4 hover:border-accent/30 transition-all cursor-pointer group relative">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary truncate max-w-[140px]">{assistant.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-text-muted" style={{ color: providerColors[assistant.llmProvider] }}>
                                {assistant.model}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={assistant.status === 'active' ? 'success' : 'gray'}>
                        {assistant.status}
                    </Badge>
                    <div className="relative">
                        <button
                            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-6 z-20 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[140px]" onMouseLeave={() => setMenuOpen(false)}>
                                <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
                                    <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => { onDuplicate(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
                                    <Copy className="w-3.5 h-3.5" /> Duplicate
                                </button>
                                <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs text-text-muted line-clamp-2">{assistant.firstMessage}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <div>
                        <p className="text-[10px] text-text-muted">Voice</p>
                        <p className="text-xs text-text-secondary font-medium">{assistant.voiceName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted">Calls</p>
                        <p className="text-xs text-text-secondary font-medium">{assistant.callCount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted">Last Active</p>
                        <p className="text-xs text-text-secondary font-medium">{format(new Date(assistant.lastActive), 'MMM d')}</p>
                    </div>
                </div>
            </div>

            <button onClick={onEdit} className="mt-3 w-full btn-secondary py-1.5 text-xs flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-3.5 h-3.5" /> Configure & Test
            </button>
        </div>
    );
}

export function AssistantListPage() {
    const { assistants, deleteAssistant, duplicateAssistant } = useAssistantStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const filtered = assistants.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) &&
        (statusFilter === 'all' || a.status === statusFilter)
    );

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteAssistant(deleteTarget);
        addToast('Assistant deleted', 'success');
        setDeleteTarget(null);
    };

    const handleDuplicate = async (id: string) => {
        await duplicateAssistant(id);
        addToast('Assistant duplicated', 'success');
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Assistants</h1>
                    <p className="text-sm text-text-muted mt-0.5">{assistants.length} voice assistants configured</p>
                </div>
                <Link to="/assistants/new" className="btn-primary flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Create Assistant
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input className="input pl-9 w-56" placeholder="Search assistants..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <div className="ml-auto flex items-center border border-border rounded-input overflow-hidden">
                    <button onClick={() => setView('grid')} className={clsx('px-3 py-2 transition-colors', view === 'grid' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary')}>
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setView('list')} className={clsx('px-3 py-2 transition-colors', view === 'list' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary')}>
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid view */}
            {filtered.length === 0 ? (
                <EmptyState icon={<Bot className="w-8 h-8" />} title="No assistants found" description="Create your first AI voice assistant to start making calls." action={<Link to="/assistants/new" className="btn-primary">Create Assistant</Link>} />
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {filtered.map(a => (
                        <AssistantCard
                            key={a.id} assistant={a}
                            onEdit={() => navigate(`/assistants/${a.id}`)}
                            onDuplicate={() => handleDuplicate(a.id)}
                            onDelete={() => setDeleteTarget(a.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Name</th><th>Model</th><th>Voice</th><th>Calls</th><th>Status</th><th>Last Active</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map(a => (
                                <tr key={a.id} onClick={() => navigate(`/assistants/${a.id}`)} className="cursor-pointer">
                                    <td className="text-text-primary font-medium">{a.name}</td>
                                    <td className="text-xs font-mono">{a.model}</td>
                                    <td>{a.voiceName}</td>
                                    <td>{a.callCount.toLocaleString()}</td>
                                    <td><Badge variant={a.status === 'active' ? 'success' : 'gray'}>{a.status}</Badge></td>
                                    <td className="text-text-muted text-xs">{format(new Date(a.lastActive), 'MMM d, HH:mm')}</td>
                                    <td>
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleDuplicate(a.id)} className="btn-ghost py-1 px-2 text-xs"><Copy className="w-3 h-3" /></button>
                                            <button onClick={() => setDeleteTarget(a.id)} className="btn-ghost py-1 px-2 text-xs text-error hover:bg-error/10"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Assistant"
                message="Are you sure you want to delete this assistant? This action cannot be undone."
                confirmLabel="Delete" danger
            />
        </div>
    );
}
