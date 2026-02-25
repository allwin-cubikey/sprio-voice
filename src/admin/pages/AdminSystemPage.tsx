import React, { useState } from 'react';
import { Server, Cpu, HardDrive, Wifi, GitBranch, Wrench, Files, Activity, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

const HEALTH_CHECKS = [
    { name: 'API Gateway', latency: '12ms', uptime: '99.99%', status: 'healthy' },
    { name: 'LLM Router', latency: '38ms', uptime: '99.95%', status: 'healthy' },
    { name: 'TTS Service', latency: '55ms', uptime: '99.91%', status: 'healthy' },
    { name: 'STT Service', latency: '29ms', uptime: '99.97%', status: 'healthy' },
    { name: 'Call Orchestrator', latency: '8ms', uptime: '100%', status: 'healthy' },
    { name: 'Webhook Dispatcher', latency: '21ms', uptime: '99.88%', status: 'degraded' },
    { name: 'Storage (S3)', latency: '43ms', uptime: '99.99%', status: 'healthy' },
    { name: 'Database (Postgres)', latency: '4ms', uptime: '100%', status: 'healthy' },
];

const RATE_LIMITS = [
    { name: 'API Requests / min', value: 1000, max: 10000 },
    { name: 'Concurrent Calls', value: 500, max: 2000 },
    { name: 'LLM Tokens / day', value: 45000, max: 100000 },
    { name: 'Webhooks / sec', value: 50, max: 200 },
];

interface FeatureFlag {
    key: string;
    label: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
}

export function AdminSystemPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([
        { key: 'workflows', label: 'Workflows', description: 'Enable the visual workflow canvas editor for users', icon: GitBranch, enabled: false },
        { key: 'tools', label: 'Tools Library', description: 'Allow users to create and attach custom tools to assistants', icon: Wrench, enabled: false },
        { key: 'files', label: 'Files / Knowledge Base', description: 'Enable file uploads and vector knowledge base per assistant', icon: Files, enabled: false },
        { key: 'analytics', label: 'Advanced Analytics', description: 'Expose the full analytics and metrics pages to users', icon: Activity, enabled: true },
        { key: 'hipaa', label: 'HIPAA Mode', description: 'Allow organizations to enable HIPAA-compliant call handling', icon: Server, enabled: true },
    ]);

    const toggle = (key: string) => setFlags(prev =>
        prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f)
    );

    const [refreshing, setRefreshing] = useState(false);
    const handleRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1200);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">System Console</h1>
                    <p className="text-sm text-rose-200/40 mt-0.5">Service health, feature flags, rate limits, and platform config</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-700/20 text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Platform healthy
                    </div>
                    <button onClick={handleRefresh}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-900/30 text-rose-200/60 hover:bg-rose-900/20 transition-colors">
                        <RefreshCw className={clsx('w-3.5 h-3.5', refreshing && 'animate-spin')} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* System health */}
            <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                <h2 className="text-sm font-semibold text-rose-100 mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4 text-rose-400" /> Service Health
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {HEALTH_CHECKS.map(h => (
                        <div key={h.name} className="flex items-center justify-between p-3 rounded-lg bg-rose-950/30 border border-rose-900/20">
                            <div className="flex items-center gap-2.5">
                                <div className={clsx('w-2 h-2 rounded-full', h.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')} />
                                <div>
                                    <p className="text-xs font-medium text-rose-100">{h.name}</p>
                                    <p className="text-[10px] text-rose-200/40">Uptime {h.uptime}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono text-rose-200/60">{h.latency}</p>
                                <p className={clsx('text-[10px] capitalize font-medium', h.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400')}>
                                    {h.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature flags */}
            <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                <h2 className="text-sm font-semibold text-rose-100 mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-rose-400" /> Feature Flags
                </h2>
                <div className="space-y-3">
                    {flags.map(f => (
                        <div key={f.key} className="flex items-center justify-between p-3 rounded-lg bg-rose-950/30 border border-rose-900/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-900/40 flex items-center justify-center flex-shrink-0">
                                    <f.icon className="w-4 h-4 text-rose-300/60" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-rose-100">{f.label}</p>
                                    <p className="text-[10px] text-rose-200/40">{f.description}</p>
                                </div>
                            </div>
                            <button onClick={() => toggle(f.key)}
                                className={clsx('w-10 h-5 rounded-full transition-colors relative flex-shrink-0', f.enabled ? 'bg-rose-600' : 'bg-rose-900/50 border border-rose-900/50')}>
                                <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', f.enabled ? 'left-5' : 'left-0.5')} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rate limits */}
            <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                <h2 className="text-sm font-semibold text-rose-100 mb-4 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-rose-400" /> Platform Rate Limits
                </h2>
                <div className="space-y-4">
                    {RATE_LIMITS.map(r => {
                        const pct = Math.round((r.value / r.max) * 100);
                        const safe = pct < 70 ? 'bg-emerald-500' : pct < 90 ? 'bg-amber-500' : 'bg-red-500';
                        return (
                            <div key={r.name}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-rose-200/70">{r.name}</span>
                                    <span className="text-rose-100 font-mono">{r.value.toLocaleString()} / {r.max.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-rose-900/30 rounded-full">
                                    <div className={clsx('h-full rounded-full transition-all', safe)} style={{ width: `${pct}%` }} />
                                </div>
                                <p className="text-[10px] text-rose-200/30 mt-0.5">{pct}% of limit</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Platform info */}
            <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                <h2 className="text-sm font-semibold text-rose-100 mb-4 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-rose-400" /> Platform Info
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {[
                        ['Version', 'v2.4.1'],
                        ['Region', 'us-east-1'],
                        ['Environment', 'Production'],
                        ['Last Deploy', 'Feb 25, 2026'],
                        ['Node Version', '20.11.0'],
                        ['Build', '#2481'],
                        ['Uptime', '47d 12h 8m'],
                        ['Memory', '68% / 16 GB'],
                    ].map(([k, v]) => (
                        <div key={k} className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/20">
                            <p className="text-[10px] text-rose-200/40 mb-1">{k}</p>
                            <p className="font-mono text-rose-100">{v}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
