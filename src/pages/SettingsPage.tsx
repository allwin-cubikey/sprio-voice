import React, { useState } from 'react';
import { Users, Building2, User, Webhook, Plug, Bell } from 'lucide-react';
import { useToastStore } from '@/store';
import { clsx } from 'clsx';

const TABS = ['Organization', 'Profile', 'Team', 'Webhooks', 'Integrations', 'Notifications'];

const TEAM_MEMBERS = [
    { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'Owner', status: 'active', joined: '2025-10-01' },
    { id: '2', name: 'Jane Smith', email: 'jane@acme.com', role: 'Admin', status: 'active', joined: '2025-11-15' },
    { id: '3', name: 'Bob Chen', email: 'bob@acme.com', role: 'Developer', status: 'active', joined: '2026-01-03' },
    { id: '4', name: 'Alice Kim', email: 'alice@acme.com', role: 'Viewer', status: 'invited', joined: '2026-02-20' },
];

const INTEGRATIONS = [
    { name: 'Twilio', desc: 'Import existing Twilio phone numbers and SIP trunks', connected: true, color: '#F22F46' },
    { name: 'Vonage', desc: 'Bring your Vonage (Nexmo) numbers to Sprio Voice', connected: false, color: '#000' },
    { name: 'Make', desc: 'Automate workflows triggered by call events', connected: false, color: '#6D00CC' },
    { name: 'Zapier', desc: 'Connect Sprio Voice to 5000+ apps', connected: false, color: '#FF4A00' },
    { name: 'Slack', desc: 'Get call notifications directly in Slack', connected: true, color: '#4A154B' },
    { name: 'HubSpot', desc: 'Sync contacts and calls with your CRM', connected: false, color: '#FF7A59' },
];

const WEBHOOK_EVENTS = ['call.started', 'call.ended', 'call.failed', 'transcript.ready', 'recording.ready'];
const NOTIF_EVENTS = ['Call completed', 'Call failed', 'New voicemail', 'Monthly report', 'API limit 80%'];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button onClick={onChange} className={clsx('w-9 h-5 rounded-full transition-colors relative flex-shrink-0', checked ? 'bg-accent' : 'bg-border')}>
            <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', checked ? 'left-4' : 'left-0.5')} />
        </button>
    );
}

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const { addToast } = useToastStore();
    const [orgName, setOrgName] = useState('Acme Corp');
    const [notifications, setNotifications] = useState<Record<string, Record<string, boolean>>>({});

    const save = () => addToast('Settings saved', 'success');

    const toggleNotif = (event: string, channel: string) => {
        setNotifications(prev => ({
            ...prev, [event]: { ...prev[event], [channel]: !prev[event]?.[channel] },
        }));
    };

    return (
        <div className="space-y-5 max-w-4xl">
            <div>
                <h1 className="text-xl font-bold text-text-primary">Settings</h1>
                <p className="text-sm text-text-muted">Manage your organization and account preferences</p>
            </div>

            <div className="tab-nav">
                {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)} className={`tab-btn ${activeTab === i ? 'active' : ''}`}>{tab}</button>
                ))}
            </div>

            {/* Organization */}
            {activeTab === 0 && (
                <div className="space-y-4 max-w-xl">
                    <div className="form-group">
                        <label className="form-label">Organization Name</label>
                        <input className="input" value={orgName} onChange={e => setOrgName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select className="input">
                            <option>America/New_York (UTC-5)</option>
                            <option>America/Los_Angeles (UTC-8)</option>
                            <option>America/Chicago (UTC-6)</option>
                            <option>Europe/London (UTC+0)</option>
                            <option>Asia/Kolkata (UTC+5:30)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Industry</label>
                        <select className="input">
                            <option>SaaS / Technology</option>
                            <option>Healthcare</option>
                            <option>Real Estate</option>
                            <option>Finance</option>
                            <option>Retail / E-commerce</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <button onClick={save} className="btn-primary">Save Organization</button>
                    <div className="card p-4 border-error/30 mt-8">
                        <h3 className="text-sm font-semibold text-error mb-2">Danger Zone</h3>
                        <p className="text-xs text-text-muted mb-3">Permanently delete this organization and all its data.</p>
                        <button className="btn-danger text-xs">Delete Organization</button>
                    </div>
                </div>
            )}

            {/* Profile */}
            {activeTab === 1 && (
                <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent">JD</div>
                        <button className="btn-secondary text-xs">Upload Photo</button>
                    </div>
                    <div className="form-group"><label className="form-label">Full Name</label><input className="input" defaultValue="John Doe" /></div>
                    <div className="form-group"><label className="form-label">Email</label><input className="input" defaultValue="john@acme.com" type="email" /></div>
                    <div className="form-group"><label className="form-label">Current Password</label><input className="input" type="password" placeholder="••••••••" /></div>
                    <div className="form-group"><label className="form-label">New Password</label><input className="input" type="password" placeholder="••••••••" /></div>
                    <button onClick={save} className="btn-primary">Save Profile</button>
                </div>
            )}

            {/* Team */}
            {activeTab === 2 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-text-muted">{TEAM_MEMBERS.length} members</p>
                        <button className="btn-primary text-xs flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Invite Member</button>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
                            <tbody>
                                {TEAM_MEMBERS.map(m => (
                                    <tr key={m.id}>
                                        <td>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{m.name}</p>
                                                <p className="text-xs text-text-muted">{m.email}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={clsx('badge', m.role === 'Owner' ? 'badge-purple' : m.role === 'Admin' ? 'badge-warning' : m.role === 'Developer' ? 'badge-info' : 'badge-gray')}>
                                                {m.role}
                                            </span>
                                        </td>
                                        <td><span className={m.status === 'active' ? 'badge-success' : 'badge-gray'}>{m.status}</span></td>
                                        <td className="text-xs text-text-muted">{m.joined}</td>
                                        <td>{m.role !== 'Owner' && <button className="text-xs text-error hover:underline">Remove</button>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Webhooks */}
            {activeTab === 3 && (
                <div className="space-y-4 max-w-xl">
                    <div className="flex justify-between">
                        <p className="text-sm text-text-muted">Receive real-time notifications for call events</p>
                        <button className="btn-primary text-xs">Add Endpoint</button>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-text-primary">https://api.acme.com/webhooks/sprio</p>
                                <p className="text-xs text-text-muted">3 events · Created Jan 15</p>
                            </div>
                            <span className="badge-success">Active</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {['call.started', 'call.ended', 'transcript.ready'].map(e => (
                                <span key={e} className="badge-info text-[10px] font-mono">{e}</span>
                            ))}
                        </div>
                    </div>
                    <div className="card p-4 text-center py-8 border-dashed">
                        <p className="text-sm text-text-muted mb-2">No other endpoints configured</p>
                        <button className="btn-secondary text-xs">+ Add Webhook Endpoint</button>
                    </div>
                </div>
            )}

            {/* Integrations */}
            {activeTab === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {INTEGRATIONS.map(integ => (
                        <div key={integ.name} className="card p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border border-border" style={{ backgroundColor: integ.color + '20', color: integ.color }}>
                                    {integ.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">{integ.name}</p>
                                    {integ.connected && <span className="badge-success text-[10px]">Connected</span>}
                                </div>
                            </div>
                            <p className="text-xs text-text-muted">{integ.desc}</p>
                            <button className={integ.connected ? 'btn-secondary text-xs' : 'btn-primary text-xs'}>
                                {integ.connected ? 'Manage' : 'Connect'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Notifications */}
            {activeTab === 5 && (
                <div className="space-y-3 max-w-2xl">
                    <div className="grid grid-cols-4 gap-4 text-xs text-text-muted font-medium pb-2 border-b border-border">
                        <span>Event</span><span className="text-center">Email</span><span className="text-center">Slack</span><span className="text-center">In-App</span>
                    </div>
                    {NOTIF_EVENTS.map(event => (
                        <div key={event} className="grid grid-cols-4 gap-4 items-center">
                            <span className="text-sm text-text-secondary">{event}</span>
                            {['email', 'slack', 'inapp'].map(ch => (
                                <div key={ch} className="flex justify-center">
                                    <Toggle checked={!!notifications[event]?.[ch]} onChange={() => toggleNotif(event, ch)} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
