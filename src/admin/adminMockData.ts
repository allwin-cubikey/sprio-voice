// ── Admin Mock Data ───────────────────────────────────────────────────────────
// Simulates platform-wide data visible only to admins

import { subDays, format } from 'date-fns';

export interface AdminUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    plan: 'free' | 'starter' | 'growth' | 'enterprise';
    status: 'active' | 'banned' | 'suspended';
    assistantCount: number;
    totalCalls: number;
    totalCost: number;
    monthlySpend: number;
    joinedAt: string;
    lastActive: string;
}

export interface AdminOrg {
    id: string;
    name: string;
    ownerEmail: string;
    plan: 'free' | 'starter' | 'growth' | 'enterprise';
    mrr: number;
    assistants: number;
    calls: number;
    minutesUsed: number;
    minutesLimit: number;
    members: number;
    joinedAt: string;
    status: 'active' | 'suspended';
}

const PLAN_MRR: Record<string, number> = { free: 0, starter: 29, growth: 99, enterprise: 499 };

export const mockAdminUsers: AdminUser[] = [
    { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'demo@sprio.io', company: 'Acme Corp', plan: 'growth', status: 'active', assistantCount: 5, totalCalls: 1240, totalCost: 124.50, monthlySpend: 99, joinedAt: subDays(new Date(), 120).toISOString(), lastActive: subDays(new Date(), 1).toISOString() },
    { id: 'u2', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@techflow.io', company: 'TechFlow Inc', plan: 'enterprise', status: 'active', assistantCount: 18, totalCalls: 8940, totalCost: 1230.00, monthlySpend: 499, joinedAt: subDays(new Date(), 200).toISOString(), lastActive: new Date().toISOString() },
    { id: 'u3', firstName: 'Marcus', lastName: 'Webb', email: 'marcus@callcenter.co', company: 'CallCenter Pro', plan: 'growth', status: 'active', assistantCount: 9, totalCalls: 3100, totalCost: 340.00, monthlySpend: 99, joinedAt: subDays(new Date(), 88).toISOString(), lastActive: subDays(new Date(), 2).toISOString() },
    { id: 'u4', firstName: 'Priya', lastName: 'Sharma', email: 'priya@healthtech.in', company: 'HealthTech India', plan: 'starter', status: 'active', assistantCount: 3, totalCalls: 440, totalCost: 29.50, monthlySpend: 29, joinedAt: subDays(new Date(), 44).toISOString(), lastActive: subDays(new Date(), 4).toISOString() },
    { id: 'u5', firstName: 'Oliver', lastName: 'Stone', email: 'oliver@realtybot.com', company: 'RealtyBot', plan: 'growth', status: 'suspended', assistantCount: 2, totalCalls: 180, totalCost: 8.20, monthlySpend: 99, joinedAt: subDays(new Date(), 60).toISOString(), lastActive: subDays(new Date(), 14).toISOString() },
    { id: 'u6', firstName: 'Amara', lastName: 'Osei', email: 'amara@finbot.africa', company: 'FinBot Africa', plan: 'enterprise', status: 'active', assistantCount: 22, totalCalls: 12800, totalCost: 2100.00, monthlySpend: 499, joinedAt: subDays(new Date(), 300).toISOString(), lastActive: subDays(new Date(), 0).toISOString() },
    { id: 'u7', firstName: 'Luca', lastName: 'Ferrari', email: 'luca@autoreply.it', company: 'AutoReply EU', plan: 'starter', status: 'active', assistantCount: 4, totalCalls: 620, totalCost: 38.00, monthlySpend: 29, joinedAt: subDays(new Date(), 30).toISOString(), lastActive: subDays(new Date(), 6).toISOString() },
    { id: 'u8', firstName: 'Nina', lastName: 'Rogers', email: 'nina@spambot.xyz', company: 'Spam Co', plan: 'free', status: 'banned', assistantCount: 1, totalCalls: 12, totalCost: 0.60, monthlySpend: 0, joinedAt: subDays(new Date(), 10).toISOString(), lastActive: subDays(new Date(), 9).toISOString() },
    { id: 'u9', firstName: 'Ethan', lastName: 'Park', email: 'ethan@shopbot.kr', company: 'ShopBot Korea', plan: 'growth', status: 'active', assistantCount: 7, totalCalls: 2200, totalCost: 198.00, monthlySpend: 99, joinedAt: subDays(new Date(), 75).toISOString(), lastActive: subDays(new Date(), 1).toISOString() },
    { id: 'u10', firstName: 'Sofia', lastName: 'Lima', email: 'sofia@voiceagent.br', company: 'VoiceAgent BR', plan: 'enterprise', status: 'active', assistantCount: 14, totalCalls: 7600, totalCost: 920.00, monthlySpend: 499, joinedAt: subDays(new Date(), 160).toISOString(), lastActive: subDays(new Date(), 0).toISOString() },
];

export const mockAdminOrgs: AdminOrg[] = mockAdminUsers
    .filter(u => u.status !== 'banned')
    .map(u => ({
        id: `org_${u.id}`,
        name: u.company,
        ownerEmail: u.email,
        plan: u.plan,
        mrr: PLAN_MRR[u.plan],
        assistants: u.assistantCount,
        calls: u.totalCalls,
        minutesUsed: Math.round(u.totalCalls * 2.3),
        minutesLimit: u.plan === 'free' ? 200 : u.plan === 'starter' ? 1000 : u.plan === 'growth' ? 5000 : 50000,
        members: Math.floor(Math.random() * 8) + 1,
        joinedAt: u.joinedAt,
        status: u.status === 'suspended' ? 'suspended' : 'active',
    }));

// Flat call list across all orgs
export interface AdminCall {
    id: string;
    orgName: string;
    assistantName: string;
    direction: 'inbound' | 'outbound';
    duration: number;
    cost: number;
    status: 'ended' | 'failed' | 'busy';
    startedAt: string;
}

const ASSISTANT_NAMES = ['Sales Qualifier', 'Support Agent', 'Booking Bot', 'Lead Gen', 'FAQ Bot', 'Outbound Dialer', 'Receptionist', 'Survey Bot'];
export const mockAdminCalls: AdminCall[] = Array.from({ length: 80 }, (_, i) => {
    const user = mockAdminUsers[i % mockAdminUsers.length];
    const dur = Math.floor(30 + Math.random() * 360);
    return {
        id: `call_adm_${String(i + 1).padStart(4, '0')}`,
        orgName: user.company,
        assistantName: ASSISTANT_NAMES[i % ASSISTANT_NAMES.length],
        direction: i % 3 === 0 ? 'outbound' : 'inbound',
        duration: dur,
        cost: +(dur * 0.008).toFixed(4),
        status: i % 12 === 0 ? 'failed' : i % 20 === 0 ? 'busy' : 'ended',
        startedAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
    };
});

// Revenue by month (last 6 months)
export function getRevenueData() {
    return Array.from({ length: 6 }, (_, i) => {
        const d = subDays(new Date(), (5 - i) * 30);
        const base = 2800 + i * 480;
        return {
            month: format(d, 'MMM yy'),
            mrr: base + Math.floor(Math.random() * 300),
            newRevenue: Math.floor(Math.random() * 600) + 200,
            churn: Math.floor(Math.random() * 120),
        };
    });
}

export function getPlatformStats() {
    const totalUsers = mockAdminUsers.length;
    const activeUsers = mockAdminUsers.filter(u => u.status === 'active').length;
    const totalMRR = mockAdminUsers.reduce((a, u) => a + PLAN_MRR[u.plan], 0);
    const totalCalls = mockAdminUsers.reduce((a, u) => a + u.totalCalls, 0);
    const totalAssistants = mockAdminUsers.reduce((a, u) => a + u.assistantCount, 0);
    const totalRevenue = mockAdminUsers.reduce((a, u) => a + u.totalCost, 0);
    const planBreakdown = {
        free: mockAdminUsers.filter(u => u.plan === 'free').length,
        starter: mockAdminUsers.filter(u => u.plan === 'starter').length,
        growth: mockAdminUsers.filter(u => u.plan === 'growth').length,
        enterprise: mockAdminUsers.filter(u => u.plan === 'enterprise').length,
    };
    const avgCallDuration = Math.round(mockAdminCalls.reduce((a, c) => a + c.duration, 0) / mockAdminCalls.length);
    return { totalUsers, activeUsers, totalMRR, totalCalls, totalAssistants, totalRevenue, planBreakdown, avgCallDuration };
}
