import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Phone, Import, MoreVertical, Edit, Trash2, ExternalLink, Bot } from 'lucide-react';
import { usePhoneNumberStore, useAssistantStore, useToastStore } from '@/store';
import { Badge, EmptyState, ConfirmDialog, Modal } from '@/components/ui/index';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const AVAILABLE_NUMBERS = [
    { number: '+14805550001', region: 'Phoenix, AZ', monthlyCost: 2.00 },
    { number: '+12065550042', region: 'Seattle, WA', monthlyCost: 2.00 },
    { number: '+16175550083', region: 'Boston, MA', monthlyCost: 2.00 },
    { number: '+13235550019', region: 'Los Angeles, CA', monthlyCost: 2.00 },
    { number: '+17135550037', region: 'Houston, TX', monthlyCost: 2.00 },
];

function BuyNumberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { createPhoneNumber } = usePhoneNumberStore();
    const { addToast } = useToastStore();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string | null>(null);
    const [buying, setBuying] = useState(false);

    const filtered = AVAILABLE_NUMBERS.filter(n =>
        n.number.includes(search) || n.region.toLowerCase().includes(search.toLowerCase())
    );

    const handleBuy = async () => {
        if (!selected) return;
        setBuying(true);
        const num = AVAILABLE_NUMBERS.find(n => n.number === selected)!;
        await createPhoneNumber({ number: num.number, label: `Number ${num.region}`, monthlyCost: num.monthlyCost });
        addToast(`Purchased ${num.number}!`, 'success');
        setBuying(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title="Buy Phone Number" size="md">
            <div className="space-y-4">
                <div className="form-group">
                    <label className="form-label">Search by area code, city, or state</label>
                    <input className="input" placeholder="e.g. 415, Seattle, TX..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filtered.map(n => (
                        <div key={n.number}
                            onClick={() => setSelected(n.number)}
                            className={clsx('flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                                selected === n.number ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-accent/50')}>
                            <div>
                                <p className="text-sm font-mono font-medium text-text-primary">{n.number}</p>
                                <p className="text-xs text-text-muted">{n.region}</p>
                            </div>
                            <span className="text-sm text-text-secondary">${n.monthlyCost.toFixed(2)}/mo</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleBuy} disabled={!selected || buying}>
                        {buying ? 'Purchasing...' : 'Buy Number'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export function PhoneNumbersPage() {
    const { phoneNumbers, deletePhoneNumber } = usePhoneNumberStore();
    const { assistants } = useAssistantStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();
    const [buyOpen, setBuyOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const getAssistant = (id: string | null) => assistants.find(a => a.id === id);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Phone Numbers</h1>
                    <p className="text-sm text-text-muted">{phoneNumbers.length} numbers in your account</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-1.5">
                        <Import className="w-4 h-4" /> Import Number
                    </button>
                    <button onClick={() => setBuyOpen(true)} className="btn-primary flex items-center gap-1.5">
                        <Plus className="w-4 h-4" /> Buy Number
                    </button>
                </div>
            </div>

            {phoneNumbers.length === 0 ? (
                <EmptyState icon={<Phone className="w-8 h-8" />} title="No phone numbers" description="Buy your first phone number to start making and receiving calls." action={<button onClick={() => setBuyOpen(true)} className="btn-primary">Buy Number</button>} />
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Number</th><th>Label</th><th>Provider</th><th>Assigned Assistant</th><th>Inbound</th><th>Outbound</th><th>Cost/mo</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            {phoneNumbers.map(pn => {
                                const asst = getAssistant(pn.assignedAssistantId);
                                return (
                                    <tr key={pn.id} onClick={() => navigate(`/phone-numbers/${pn.id}`)} className="cursor-pointer">
                                        <td className="font-mono text-sm text-text-primary">{pn.number}</td>
                                        <td>{pn.label}</td>
                                        <td className="capitalize">{pn.provider}</td>
                                        <td>
                                            {asst ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Bot className="w-3.5 h-3.5 text-accent" />
                                                    <span className="text-sm">{asst.name}</span>
                                                </div>
                                            ) : <span className="text-text-muted text-xs">Unassigned</span>}
                                        </td>
                                        <td className="text-text-secondary">{pn.inboundCount.toLocaleString()}</td>
                                        <td className="text-text-secondary">{pn.outboundCount.toLocaleString()}</td>
                                        <td className="font-mono text-xs">${pn.monthlyCost.toFixed(2)}</td>
                                        <td><Badge variant={pn.status === 'active' ? 'success' : 'gray'}>{pn.status}</Badge></td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setDeleteTarget(pn.id)} className="text-text-muted hover:text-error transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <BuyNumberModal open={buyOpen} onClose={() => setBuyOpen(false)} />
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={async () => { if (deleteTarget) { await deletePhoneNumber(deleteTarget); addToast('Number released', 'success'); setDeleteTarget(null); } }}
                title="Release Number" message="Are you sure you want to release this phone number? This cannot be undone." confirmLabel="Release" danger />
        </div>
    );
}

export function PhoneNumberDetailPage() {
    const navigate = useNavigate();
    const { phoneNumbers, updatePhoneNumber } = usePhoneNumberStore();
    const { assistants } = useAssistantStore();
    const { addToast } = useToastStore();
    const id = window.location.pathname.split('/').pop();
    const pn = phoneNumbers.find(p => p.id === id);

    if (!pn) return <div className="text-text-muted text-center py-16">Number not found</div>;

    const save = async (data: any) => {
        await updatePhoneNumber(pn.id, data);
        addToast('Settings saved', 'success');
    };

    return (
        <div className="space-y-5 max-w-2xl">
            <button onClick={() => navigate('/phone-numbers')} className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors">
                ← Back to Phone Numbers
            </button>
            <div>
                <h1 className="text-xl font-bold font-mono text-text-primary">{pn.number}</h1>
                <p className="text-sm text-text-muted">{pn.label} · {pn.provider}</p>
            </div>

            <div className="card p-5 space-y-4">
                <h2 className="section-title">Number Settings</h2>
                <div className="form-group">
                    <label className="form-label">Label</label>
                    <input className="input" defaultValue={pn.label} onBlur={e => save({ label: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Assigned Assistant</label>
                    <select className="input" defaultValue={pn.assignedAssistantId || ''} onChange={e => save({ assignedAssistantId: e.target.value || null })}>
                        <option value="">No assistant</option>
                        {assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Webhook URL (Inbound)</label>
                    <input className="input font-mono text-xs" defaultValue={pn.webhookUrl} placeholder="https://your-server.com/webhook" onBlur={e => save({ webhookUrl: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Call Forwarding</p>
                        <p className="text-xs text-text-muted">Forward calls to a backup number</p>
                    </div>
                    <button onClick={() => save({ forwardingEnabled: !pn.forwardingEnabled })}
                        className={clsx('w-10 h-5 rounded-full transition-colors relative', pn.forwardingEnabled ? 'bg-accent' : 'bg-border')}>
                        <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', pn.forwardingEnabled ? 'left-5' : 'left-0.5')} />
                    </button>
                </div>
                {pn.forwardingEnabled && (
                    <div className="form-group">
                        <label className="form-label">Forwarding Number</label>
                        <input className="input font-mono" defaultValue={pn.forwardingNumber} placeholder="+1 (555) 000-0000" onBlur={e => save({ forwardingNumber: e.target.value })} />
                    </div>
                )}
            </div>

            <div className="card p-5">
                <h2 className="section-title">Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xs text-text-muted">Inbound Calls</p><p className="text-xl font-bold text-text-primary">{pn.inboundCount.toLocaleString()}</p></div>
                    <div><p className="text-xs text-text-muted">Outbound Calls</p><p className="text-xl font-bold text-text-primary">{pn.outboundCount.toLocaleString()}</p></div>
                    <div><p className="text-xs text-text-muted">Monthly Cost</p><p className="text-xl font-bold text-text-primary">${pn.monthlyCost}/mo</p></div>
                </div>
            </div>
        </div>
    );
}
