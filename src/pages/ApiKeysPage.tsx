import React, { useState } from 'react';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Shield } from 'lucide-react';
import { useApiKeyStore, useToastStore } from '@/store';
import { Badge, EmptyState, ConfirmDialog, Modal, CopyButton, CodeBlock } from '@/components/ui/index';
import { format } from 'date-fns';
import { clsx } from 'clsx';

function CreateKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { createApiKey } = useApiKeyStore();
    const { addToast } = useToastStore();
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<string[]>(['read']);
    const [created, setCreated] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    const togglePerm = (p: string) => setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

    const handleCreate = async () => {
        if (!name) return;
        setCreating(true);
        const key = await createApiKey({ name, permissions: permissions as any[] });
        setCreated(key.fullKey || '');
        setCreating(false);
        addToast('API key created', 'success');
    };

    const handleClose = () => { setCreated(null); setName(''); setPermissions(['read']); onClose(); };

    return (
        <Modal open={open} onClose={handleClose} title="Create API Key" size="md">
            {created ? (
                <div className="space-y-4">
                    <div className="card p-4 border-success/30 bg-success/5">
                        <p className="text-xs text-success mb-2 font-medium">✅ Key created — copy it now, it won't be shown again</p>
                        <code className="text-xs font-mono text-text-primary break-all">{created}</code>
                    </div>
                    <div className="flex gap-2">
                        <CopyButton value={created} className="flex-1 text-center py-1.5 rounded-input" />
                        <button onClick={handleClose} className="btn-primary flex-1">Done</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">Key Name</label>
                        <input className="input" placeholder="e.g. Production Server" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Permissions</label>
                        <div className="flex gap-2">
                            {['read', 'write', 'admin'].map(p => (
                                <button key={p} onClick={() => togglePerm(p)}
                                    className={clsx('flex-1 py-2 rounded-input border text-sm font-medium transition-colors capitalize',
                                        permissions.includes(p) ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:border-accent/50')}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button className="btn-secondary" onClick={handleClose}>Cancel</button>
                        <button className="btn-primary" onClick={handleCreate} disabled={!name || creating}>
                            {creating ? 'Creating...' : 'Create Key'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export function ApiKeysPage() {
    const { apiKeys, revokeApiKey } = useApiKeyStore();
    const { addToast } = useToastStore();
    const [createOpen, setCreateOpen] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    const toggleVisibility = (id: string) => setVisibleKeys(prev => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
    });

    const curlExample = `curl -X GET "https://api.sprio.io/v1/assistants" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

    const nodeExample = `import Sprio from '@sprio/sdk';
const client = new Sprio({ apiKey: 'YOUR_API_KEY' });
const assistants = await client.assistants.list();`;

    const pyExample = `from sprio import Sprio
client = Sprio(api_key="YOUR_API_KEY")
assistants = client.assistants.list()`;

    const [codeTab, setCodeTab] = useState(0);
    const codeExamples = [
        { label: 'cURL', code: curlExample, lang: 'bash' },
        { label: 'Node.js', code: nodeExample, lang: 'js' },
        { label: 'Python', code: pyExample, lang: 'python' },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">API Keys</h1>
                    <p className="text-sm text-text-muted">Manage API keys for authenticating with the Sprio Voice API</p>
                </div>
                <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Create API Key
                </button>
            </div>

            {/* Keys Table */}
            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Name</th><th>Key</th><th>Permissions</th><th>Created</th><th>Last Used</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                        {apiKeys.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-text-muted">No API keys</td></tr>
                        ) : apiKeys.map(key => (
                            <tr key={key.id}>
                                <td className="font-medium text-text-primary">{key.name}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs font-mono text-text-secondary">
                                            {visibleKeys.has(key.id) ? key.fullKey : key.keyMasked}
                                        </code>
                                        <button onClick={() => toggleVisibility(key.id)} className="text-text-muted hover:text-text-primary">
                                            {visibleKeys.has(key.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                        <CopyButton value={key.fullKey || key.keyMasked} />
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-1">
                                        {key.permissions.map(p => <Badge key={p} variant={p === 'admin' ? 'error' : p === 'write' ? 'warning' : 'info'} className="capitalize">{p}</Badge>)}
                                    </div>
                                </td>
                                <td className="text-text-muted text-xs">{format(new Date(key.createdAt), 'MMM d, yyyy')}</td>
                                <td className="text-text-muted text-xs">{key.lastUsed ? format(new Date(key.lastUsed), 'MMM d, HH:mm') : 'Never'}</td>
                                <td><Badge variant={key.revoked ? 'error' : 'success'}>{key.revoked ? 'Revoked' : 'Active'}</Badge></td>
                                <td>
                                    {!key.revoked && (
                                        <button onClick={() => setRevokeTarget(key.id)} className="text-text-muted hover:text-error transition-colors p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Code Examples */}
            <div className="card p-5">
                <h2 className="section-title">Using Your API Key</h2>
                <div className="flex gap-1 mb-3">
                    {codeExamples.map((ex, i) => (
                        <button key={ex.label} onClick={() => setCodeTab(i)}
                            className={clsx('px-3 py-1.5 text-xs rounded font-medium transition-colors',
                                codeTab === i ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary')}>
                            {ex.label}
                        </button>
                    ))}
                </div>
                <CodeBlock code={codeExamples[codeTab].code} language={codeExamples[codeTab].lang} />
            </div>

            <CreateKeyModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <ConfirmDialog open={!!revokeTarget} onClose={() => setRevokeTarget(null)}
                onConfirm={async () => { if (revokeTarget) { await revokeApiKey(revokeTarget); addToast('API key revoked', 'warning'); setRevokeTarget(null); } }}
                title="Revoke API Key" message="This key will immediately stop working. This action cannot be undone." confirmLabel="Revoke" danger />
        </div>
    );
}
