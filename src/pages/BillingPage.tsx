import React, { useState } from 'react';
import { CreditCard, Zap, Check, AlertCircle } from 'lucide-react';

const PLANS = [
    {
        name: 'Free', price: 0, cycle: 'forever',
        features: ['100 calls/month', '60 min included', '1 assistant', '1 phone number', 'Community support'],
        action: 'Current Plan', current: false,
    },
    {
        name: 'Starter', price: 29, cycle: 'month',
        features: ['2,000 calls/month', '1,500 min included', '5 assistants', '3 phone numbers', 'Email support', 'Call recordings'],
        action: 'Subscribe', current: true, highlighted: false,
    },
    {
        name: 'Growth', price: 99, cycle: 'month',
        features: ['10,000 calls/month', '8,000 min included', 'Unlimited assistants', '10 phone numbers', 'Priority support', 'Call recordings', 'Advanced analytics', 'Custom CNAME'],
        action: 'Upgrade', current: false, highlighted: true,
    },
    {
        name: 'Enterprise', price: null, cycle: 'custom',
        features: ['Unlimited calls', 'Custom minutes', 'Unlimited everything', 'Dedicated support', 'SLA guarantee', 'HIPAA compliance', 'SSO/SAML', 'Custom integrations'],
        action: 'Contact Sales', current: false,
    },
];

const INVOICES = [
    { id: 'inv_001', date: '2026-02-01', amount: 29.00, status: 'paid' },
    { id: 'inv_002', date: '2026-01-01', amount: 29.00, status: 'paid' },
    { id: 'inv_003', date: '2025-12-01', amount: 29.00, status: 'paid' },
    { id: 'inv_004', date: '2025-11-01', amount: 14.50, status: 'paid' },
];

const CREDITS = [10, 25, 50, 100];

export function BillingPage() {
    const [customAmount, setCustomAmount] = useState('');
    const [selectedCredit, setSelectedCredit] = useState<number | null>(null);

    const usedMin = 1250;
    const planMin = 1500;
    const usedPct = Math.min(100, (usedMin / planMin) * 100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-text-primary">Billing</h1>
                <p className="text-sm text-text-muted">Manage your subscription, usage, and payment</p>
            </div>

            {/* Current Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="card p-5 lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-text-muted mb-1">Current Plan</p>
                            <p className="text-xl font-bold text-text-primary">Starter</p>
                            <p className="text-sm text-text-muted">$29.00/month · Renews Mar 1, 2026</p>
                        </div>
                        <span className="badge-success">Active</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs text-text-muted mb-1.5">
                                <span>Minutes Used</span><span>{usedMin} / {planMin} min</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-2">
                                <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${usedPct}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-text-muted mb-1.5">
                                <span>API Calls</span><span>18,420 / 50,000</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-2">
                                <div className="bg-success h-2 rounded-full" style={{ width: '36.8%' }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <p className="text-xs text-text-muted mb-1">Payment Method</p>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="p-2 bg-white/5 rounded-lg"><CreditCard className="w-5 h-5 text-text-muted" /></div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">•••• •••• •••• 4242</p>
                            <p className="text-xs text-text-muted">Visa · Expires 12/27</p>
                        </div>
                    </div>
                    <button className="btn-secondary mt-3 w-full text-xs py-1.5">Update Card</button>
                </div>
            </div>

            {/* Plans */}
            <div>
                <h2 className="section-title">Choose a Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {PLANS.map(plan => (
                        <div key={plan.name} className={`card p-4 relative flex flex-col ${plan.highlighted ? 'border-accent glow-border' : ''}`}>
                            {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] px-3 py-0.5 rounded-full font-medium">Most Popular</div>}
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-text-primary">{plan.name}</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    {plan.price === null ? (
                                        <span className="text-xl font-bold text-text-primary">Custom</span>
                                    ) : (
                                        <>
                                            <span className="text-2xl font-bold text-text-primary">${plan.price}</span>
                                            <span className="text-xs text-text-muted">/{plan.cycle}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ul className="space-y-2 flex-1 mb-4">
                                {plan.features.map(f => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-text-secondary">
                                        <Check className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full text-sm py-2 rounded-input font-medium transition-colors ${plan.current ? 'bg-white/10 text-text-muted cursor-default' : plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                                {plan.action}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Credits */}
            <div className="card p-5">
                <h2 className="section-title">Add Credits (Pay-as-you-go)</h2>
                <p className="text-sm text-text-muted mb-4">Top up credits for usage beyond your plan limits. Credits never expire.</p>
                <div className="flex flex-wrap gap-3 mb-4">
                    {CREDITS.map(amt => (
                        <button key={amt} onClick={() => setSelectedCredit(amt)}
                            className={`px-5 py-2.5 rounded-input border font-medium text-sm transition-colors ${selectedCredit === amt ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-accent/50'}`}>
                            ${amt}
                        </button>
                    ))}
                    <input
                        className="input w-32 py-2.5"
                        placeholder="Custom $"
                        value={customAmount}
                        onChange={e => { setCustomAmount(e.target.value); setSelectedCredit(null); }}
                    />
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Add ${selectedCredit || customAmount || '—'} Credits
                </button>
            </div>

            {/* Invoices */}
            <div>
                <h2 className="section-title">Invoice History</h2>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            {INVOICES.map(inv => (
                                <tr key={inv.id}>
                                    <td className="font-mono text-xs text-accent">{inv.id}</td>
                                    <td className="text-text-muted text-xs">{inv.date}</td>
                                    <td className="font-medium">${inv.amount.toFixed(2)}</td>
                                    <td><span className="badge-success capitalize">{inv.status}</span></td>
                                    <td><button className="text-xs text-accent hover:underline">Download PDF</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
