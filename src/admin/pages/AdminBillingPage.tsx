import React from 'react';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getRevenueData, getPlatformStats, mockAdminUsers } from '../adminMockData';
import { format, addDays } from 'date-fns';
import { clsx } from 'clsx';

const stats = getPlatformStats();
const revenueData = getRevenueData();

const PIE_COLORS = ['#374151', '#0ea5e9', '#7c3aed', '#d97706'];
const planBreakdownPie = [
    { name: 'Free', value: stats.planBreakdown.free },
    { name: 'Starter ($29)', value: stats.planBreakdown.starter },
    { name: 'Growth ($99)', value: stats.planBreakdown.growth },
    { name: 'Enterprise ($499)', value: stats.planBreakdown.enterprise },
];

// Upcoming renewals (simulated)
const renewals = mockAdminUsers
    .filter(u => u.plan !== 'free' && u.status === 'active')
    .slice(0, 6)
    .map((u, i) => ({
        company: u.company,
        plan: u.plan,
        amount: u.monthlySpend,
        renewalDate: format(addDays(new Date(), i * 3 + 2), 'MMM d, yyyy'),
    }));

const planColors: Record<string, string> = {
    starter: 'bg-sky-900/40 text-sky-300',
    growth: 'bg-violet-900/40 text-violet-300',
    enterprise: 'bg-amber-900/40 text-amber-300',
};

function MiniKPI({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
    return (
        <div className="rounded-xl border border-rose-900/20 p-4 flex items-center gap-4" style={{ background: '#150a0a' }}>
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-[10px] text-rose-200/40 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{value}</p>
            </div>
        </div>
    );
}

export function AdminBillingPage() {
    const arr = stats.totalMRR * 12;
    const latestMRR = revenueData[revenueData.length - 1]?.mrr ?? stats.totalMRR;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-white">Billing & Revenue</h1>
                <p className="text-sm text-rose-200/40 mt-0.5">Platform-wide revenue, subscriptions, and renewal schedule</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MiniKPI label="Current MRR" value={`$${latestMRR.toLocaleString()}`} icon={DollarSign} color="bg-emerald-700" />
                <MiniKPI label="ARR (Projected)" value={`$${arr.toLocaleString()}`} icon={TrendingUp} color="bg-violet-700" />
                <MiniKPI label="Paying Users" value={`${mockAdminUsers.filter(u => u.plan !== 'free').length}`} icon={Users} color="bg-sky-700" />
                <MiniKPI label="Total Billed" value={`$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={CreditCard} color="bg-amber-700" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* MRR trend */}
                <div className="lg:col-span-2 rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                    <h2 className="text-sm font-semibold text-rose-100 mb-1">MRR & New Revenue</h2>
                    <p className="text-xs text-rose-200/40 mb-4">Last 6 months</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#be123c" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#be123c" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,29,72,0.08)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,200,210,0.4)' }} />
                            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,200,210,0.4)' }} />
                            <Tooltip contentStyle={{ background: '#1a0808', border: '1px solid rgba(225,29,72,0.3)', borderRadius: 8, fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,200,210,0.5)' }} />
                            <Area type="monotone" dataKey="mrr" name="MRR" stroke="#be123c" fill="url(#mrrGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="newRevenue" name="New Revenue" stroke="#10b981" fill="url(#newGrad)" strokeWidth={1.5} />
                            <Area type="monotone" dataKey="churn" name="Churn" stroke="#ef4444" fill="none" strokeWidth={1} strokeDasharray="4 2" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Plan distribution pie */}
                <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                    <h2 className="text-sm font-semibold text-rose-100 mb-1">Plan Distribution</h2>
                    <p className="text-xs text-rose-200/40 mb-2">By user count</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={planBreakdownPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                                {planBreakdownPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1a0808', border: '1px solid rgba(225,29,72,0.3)', borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {planBreakdownPie.map((p, i) => (
                            <div key={p.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                                    <span className="text-rose-200/60">{p.name}</span>
                                </div>
                                <span className="text-rose-100 font-medium">{p.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming renewals */}
            <div className="rounded-xl border border-rose-900/20 p-4" style={{ background: '#150a0a' }}>
                <h2 className="text-sm font-semibold text-rose-100 mb-4">Upcoming Renewals</h2>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-rose-900/30 text-rose-200/40">
                            <th className="text-left pb-2 font-medium">Organization</th>
                            <th className="text-left pb-2 font-medium">Plan</th>
                            <th className="text-right pb-2 font-medium">Amount</th>
                            <th className="text-left pb-2 font-medium">Renewal Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renewals.map((r, i) => (
                            <tr key={i} className="border-b border-rose-900/15 hover:bg-rose-900/10 transition-colors">
                                <td className="py-2.5 text-rose-100">{r.company}</td>
                                <td className="py-2.5">
                                    <span className={clsx('px-2 py-0.5 rounded text-[10px] font-semibold capitalize', planColors[r.plan])}>{r.plan}</span>
                                </td>
                                <td className="py-2.5 text-right text-emerald-400 font-semibold">${r.amount}/mo</td>
                                <td className="py-2.5 text-rose-200/50">{r.renewalDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
