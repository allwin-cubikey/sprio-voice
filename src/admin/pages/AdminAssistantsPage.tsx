import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { mockAdminUsers } from '../adminMockData';
import { clsx } from 'clsx';

interface PlatformAssistant {
    id: string;
    name: string;
    org: string;
    ownerEmail: string;
    llmProvider: string;
    model: string;
    voice: string;
    callCount: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

const LLM_PROVIDERS = ['openai', 'anthropic', 'groq', 'together', 'openai', 'anthropic', 'groq', 'openai', 'openai', 'anthropic'];
const MODELS = ['gpt-4o', 'claude-3-5-sonnet', 'llama-3-70b', 'mixtral-8x7b', 'gpt-4o-mini', 'claude-3-haiku', 'gemma-7b', 'gpt-4o', 'gpt-4-turbo', 'claude-3-opus'];
const VOICES = ['Rachel (ElevenLabs)', 'Adam (ElevenLabs)', 'Nova (OpenAI)', 'Aria (PlayHT)', 'Bella (ElevenLabs)', 'Josh (ElevenLabs)', 'Alloy (OpenAI)', 'Echo (OpenAI)', 'Fable (OpenAI)', 'Rachel (ElevenLabs)'];
const NAMES = ['Sales Qualifier', 'Support Agent', 'Booking Bot', 'Lead Gen AI', 'FAQ Assistant', 'Outbound Dialer', 'Receptionist', 'Survey Bot', 'Compliance Bot', 'Onboarding Guide'];

const platformAssistants: PlatformAssistant[] = mockAdminUsers.flatMap((u, ui) =>
    Array.from({ length: u.assistantCount }).map((_, ai) => ({
        id: `asst_${u.id}_${ai}`,
        name: `${u.company} — ${NAMES[(ui + ai) % NAMES.length]}`,
        org: u.company,
        ownerEmail: u.email,
        llmProvider: LLM_PROVIDERS[ui % LLM_PROVIDERS.length],
        model: MODELS[ui % MODELS.length],
        voice: VOICES[(ui + ai) % VOICES.length],
        callCount: Math.floor(u.totalCalls / Math.max(u.assistantCount, 1)) + Math.floor(Math.random() * 50),
        status: ai === 0 && u.status === 'suspended' ? 'inactive' : 'active',
        createdAt: u.joinedAt,
    }))
);

const providerColors: Record<string, string> = {
    openai: 'bg-emerald-900/40 text-emerald-300',
    anthropic: 'bg-amber-900/40 text-amber-300',
    groq: 'bg-violet-900/40 text-violet-300',
    together: 'bg-sky-900/40 text-sky-300',
};

export function AdminAssistantsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = platformAssistants.filter(a => {
        const q = search.toLowerCase();
        const matchQ = !q || a.name.toLowerCase().includes(q) || a.org.toLowerCase().includes(q) || a.model.toLowerCase().includes(q);
        return matchQ && (statusFilter === 'all' || a.status === statusFilter);
    });

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Assistants</h1>
                    <p className="text-sm text-rose-200/40 mt-0.5">{platformAssistants.length} assistants across all organizations</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-emerald-900/30 border border-emerald-700/30 text-emerald-400">
                        {platformAssistants.filter(a => a.status === 'active').length} Active
                    </span>
                    <span className="px-2 py-1 rounded-md bg-rose-900/30 border border-rose-700/30 text-rose-400">
                        {platformAssistants.filter(a => a.status === 'inactive').length} Inactive
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400/40" />
                    <input className="w-full bg-rose-950/30 border border-rose-900/30 text-rose-100 placeholder-rose-400/30 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-rose-600/50"
                        placeholder="Search assistants, organizations, models…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="bg-rose-950/30 border border-rose-900/30 text-rose-200/70 text-xs rounded-lg px-3 py-2 focus:outline-none">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="rounded-xl border border-rose-900/20 overflow-hidden" style={{ background: '#150a0a' }}>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-rose-900/30 text-rose-200/40">
                            <th className="text-left px-4 py-3 font-medium">Assistant</th>
                            <th className="text-left px-4 py-3 font-medium">Organization</th>
                            <th className="text-left px-4 py-3 font-medium">LLM</th>
                            <th className="text-left px-4 py-3 font-medium">Voice</th>
                            <th className="text-right px-4 py-3 font-medium">Calls</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 60).map(a => (
                            <tr key={a.id} className="border-b border-rose-900/15 hover:bg-rose-900/10 transition-colors">
                                <td className="px-4 py-3 font-medium text-rose-100">{a.name}</td>
                                <td className="px-4 py-3">
                                    <p className="text-rose-200/70">{a.org}</p>
                                    <p className="text-rose-200/30">{a.ownerEmail}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize', providerColors[a.llmProvider] || 'bg-zinc-700/40 text-zinc-300')}>
                                        {a.llmProvider}
                                    </span>
                                    <p className="text-rose-200/30 mt-0.5">{a.model}</p>
                                </td>
                                <td className="px-4 py-3 text-rose-200/50">{a.voice}</td>
                                <td className="px-4 py-3 text-right text-rose-200/70">{a.callCount.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <div className={clsx('w-2 h-2 rounded-full inline-block', a.status === 'active' ? 'bg-emerald-400' : 'bg-rose-600')} />
                                    <span className={clsx('ml-1.5', a.status === 'active' ? 'text-emerald-400' : 'text-rose-400')}>{a.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-rose-200/30 text-sm">No assistants match your filters</div>
                )}
                {filtered.length > 60 && (
                    <div className="text-center py-3 text-rose-200/30 text-xs border-t border-rose-900/20">
                        Showing 60 of {filtered.length} assistants
                    </div>
                )}
            </div>
        </div>
    );
}
