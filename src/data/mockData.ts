import { format, subDays, subHours, subMinutes } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────────────────

export type AssistantStatus = 'active' | 'inactive';
export type CallStatus = 'ended' | 'failed' | 'busy' | 'no-answer' | 'in-progress';
export type CallDirection = 'inbound' | 'outbound';
export type VoiceProvider = 'elevenlabs' | 'deepgram' | 'playht' | 'rime' | 'azure' | 'cartesia' | 'openai';
export type LLMProvider = 'openai' | 'anthropic' | 'together' | 'groq' | 'custom';
export type TranscriberProvider = 'deepgram' | 'assemblyai' | 'talkscriber';

export interface Assistant {
    id: string;
    name: string;
    firstMessage: string;
    systemPrompt: string;
    llmProvider: LLMProvider;
    model: string;
    temperature: number;
    maxTokens: number;
    voiceProvider: VoiceProvider;
    voiceId: string;
    voiceName: string;
    voiceSpeed: number;
    transcriberProvider: TranscriberProvider;
    transcriberModel: string;
    language: string;
    status: AssistantStatus;
    callCount: number;
    lastActive: string;
    createdAt: string;
    backgroundDenoising: boolean;
    recording: boolean;
    hipaaMode: boolean;
    backgroundSound: 'office' | 'coffee' | 'none';
    endCallPhrases: string[];
    summaryPrompt: string;
    successEvalPrompt: string;
    responseDelay: number;
    endpointingMs: number;
}

export interface PhoneNumber {
    id: string;
    number: string;
    provider: 'twilio' | 'vonage' | 'bandwidth';
    label: string;
    assignedAssistantId: string | null;
    inboundCount: number;
    outboundCount: number;
    monthlyCost: number;
    status: 'active' | 'inactive';
    createdAt: string;
    webhookUrl: string;
    forwardingEnabled: boolean;
    forwardingNumber: string;
}

export interface CallTranscriptEntry {
    id: string;
    speaker: 'user' | 'assistant';
    text: string;
    timestamp: number; // seconds from call start
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Call {
    id: string;
    direction: CallDirection;
    status: CallStatus;
    assistantId: string;
    assistantName: string;
    fromNumber: string;
    toNumber: string;
    phoneNumberId?: string;
    duration: number; // seconds
    cost: number; // USD
    startedAt: string;
    endedAt: string;
    transcript: CallTranscriptEntry[];
    summary?: string;
    successEval?: boolean;
    metadata?: Record<string, string>;
    latency: {
        llm: number;
        tts: number;
        stt: number;
    };
    costBreakdown: {
        llm: number;
        tts: number;
        stt: number;
        telephony: number;
    };
}

export interface Squad {
    id: string;
    name: string;
    description: string;
    members: {
        assistantId: string;
        assistantName: string;
        transferCondition?: string;
        targetAssistantId?: string;
    }[];
    defaultAssistantId: string;
    callCount: number;
    createdAt: string;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT';
    headers: { key: string; value: string }[];
    bodyTemplate: string;
    parametersSchema: string;
    timeout: number;
    callCount: number;
    lastUsed: string;
    createdAt: string;
}

export interface FileRecord {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
    status: 'processing' | 'ready' | 'error';
    usageCount: number;
    url: string;
}

export interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    keyMasked: string;
    fullKey?: string;
    permissions: ('read' | 'write' | 'admin')[];
    createdAt: string;
    lastUsed: string | null;
    expiresAt: string | null;
    revoked: boolean;
}

// ─── Mock Data Generators ───────────────────────────────────────────────────

const voices = [
    { id: 'rachel', name: 'Rachel', provider: 'elevenlabs' as VoiceProvider },
    { id: 'adam', name: 'Adam', provider: 'elevenlabs' as VoiceProvider },
    { id: 'bella', name: 'Bella', provider: 'elevenlabs' as VoiceProvider },
    { id: 'josh', name: 'Josh', provider: 'elevenlabs' as VoiceProvider },
    { id: 'aria', name: 'Aria', provider: 'playht' as VoiceProvider },
    { id: 'nova', name: 'Nova', provider: 'openai' as VoiceProvider },
    { id: 'alloy', name: 'Alloy', provider: 'openai' as VoiceProvider },
];

const models: Record<LLMProvider, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
    together: ['llama-3-70b', 'mixtral-8x7b'],
    groq: ['llama-3-70b-groq', 'mixtral-8x7b-groq'],
    custom: ['custom-model'],
};

export const mockAssistants: Assistant[] = [
    {
        id: 'asst_01',
        name: 'SupportBot Pro',
        firstMessage: "Hi! I'm here to help with your support questions. What can I assist you with today?",
        systemPrompt: `You are a professional customer support agent for Acme Corp. Be friendly, concise, and always try to resolve issues on the first call. If you cannot resolve an issue, escalate to a human agent.`,
        llmProvider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 512,
        voiceProvider: 'elevenlabs',
        voiceId: 'rachel',
        voiceName: 'Rachel',
        voiceSpeed: 1.0,
        transcriberProvider: 'deepgram',
        transcriberModel: 'nova-2',
        language: 'en',
        status: 'active',
        callCount: 1284,
        lastActive: subHours(new Date(), 2).toISOString(),
        createdAt: subDays(new Date(), 45).toISOString(),
        backgroundDenoising: true,
        recording: true,
        hipaaMode: false,
        backgroundSound: 'office',
        endCallPhrases: ['goodbye', 'thanks bye', 'see you later'],
        summaryPrompt: 'Summarize the key issue and resolution from this call.',
        successEvalPrompt: 'Was the customer issue resolved in this call?',
        responseDelay: 0,
        endpointingMs: 500,
    },
    {
        id: 'asst_02',
        name: 'Sales Qualifier',
        firstMessage: "Hello! I'm calling on behalf of TechVentures. I'd love to learn about your business needs. Do you have a few minutes?",
        systemPrompt: `You are an outbound sales development representative. Your goal is to qualify leads, understand pain points, and schedule demos with account executives.`,
        llmProvider: 'anthropic',
        model: 'claude-3-5-sonnet',
        temperature: 0.8,
        maxTokens: 400,
        voiceProvider: 'elevenlabs',
        voiceId: 'adam',
        voiceName: 'Adam',
        voiceSpeed: 1.05,
        transcriberProvider: 'deepgram',
        transcriberModel: 'nova-2',
        language: 'en',
        status: 'active',
        callCount: 876,
        lastActive: subHours(new Date(), 5).toISOString(),
        createdAt: subDays(new Date(), 60).toISOString(),
        backgroundDenoising: true,
        recording: true,
        hipaaMode: false,
        backgroundSound: 'none',
        endCallPhrases: ['goodbye', 'have a great day'],
        summaryPrompt: 'Summarize the lead qualification outcome and next steps.',
        successEvalPrompt: 'Was a demo meeting scheduled during this call?',
        responseDelay: 200,
        endpointingMs: 600,
    },
    {
        id: 'asst_03',
        name: 'Appointment Scheduler',
        firstMessage: "Hi, this is Aria from MedCenter. I'm calling to confirm your upcoming appointment. Is this a good time?",
        systemPrompt: `You are a medical appointment scheduling assistant. Help patients confirm, reschedule, or cancel appointments. Always verify patient identity before sharing any information.`,
        llmProvider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.5,
        maxTokens: 300,
        voiceProvider: 'playht',
        voiceId: 'aria',
        voiceName: 'Aria',
        voiceSpeed: 0.95,
        transcriberProvider: 'assemblyai',
        transcriberModel: 'best',
        language: 'en',
        status: 'active',
        callCount: 2341,
        lastActive: subMinutes(new Date(), 15).toISOString(),
        createdAt: subDays(new Date(), 90).toISOString(),
        backgroundDenoising: true,
        recording: true,
        hipaaMode: true,
        backgroundSound: 'none',
        endCallPhrases: ['goodbye', 'take care', 'bye bye'],
        summaryPrompt: 'Summarize the appointment status and any changes made.',
        successEvalPrompt: 'Was the appointment confirmed, rescheduled, or cancelled successfully?',
        responseDelay: 100,
        endpointingMs: 400,
    },
    {
        id: 'asst_04',
        name: 'Lead Follow-Up Bot',
        firstMessage: "Hi! Is this a good time? I'm following up on your recent inquiry about our services.",
        systemPrompt: `You are a lead nurturing specialist. Follow up on web form inquiries, answer product questions, and move prospects through the sales funnel.`,
        llmProvider: 'groq',
        model: 'llama-3-70b-groq',
        temperature: 0.75,
        maxTokens: 500,
        voiceProvider: 'elevenlabs',
        voiceId: 'bella',
        voiceName: 'Bella',
        voiceSpeed: 1.0,
        transcriberProvider: 'deepgram',
        transcriberModel: 'nova-2',
        language: 'en',
        status: 'inactive',
        callCount: 445,
        lastActive: subDays(new Date(), 3).toISOString(),
        createdAt: subDays(new Date(), 30).toISOString(),
        backgroundDenoising: true,
        recording: false,
        hipaaMode: false,
        backgroundSound: 'coffee',
        endCallPhrases: ['goodbye', 'talk soon'],
        summaryPrompt: 'Summarize lead interest level and any product questions.',
        successEvalPrompt: 'Did the prospect agree to a follow-up step?',
        responseDelay: 300,
        endpointingMs: 500,
    },
    {
        id: 'asst_05',
        name: 'Survey Collector',
        firstMessage: "Hello! This is a quick 2-minute survey call about your recent stay. Would you be willing to share your feedback?",
        systemPrompt: `You are a customer satisfaction survey agent. Collect NPS scores, qualitative feedback, and specific ratings for different aspects of the service.`,
        llmProvider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.6,
        maxTokens: 300,
        voiceProvider: 'openai',
        voiceId: 'nova',
        voiceName: 'Nova',
        voiceSpeed: 1.0,
        transcriberProvider: 'deepgram',
        transcriberModel: 'nova-2',
        language: 'en',
        status: 'active',
        callCount: 3890,
        lastActive: subMinutes(new Date(), 45).toISOString(),
        createdAt: subDays(new Date(), 120).toISOString(),
        backgroundDenoising: false,
        recording: true,
        hipaaMode: false,
        backgroundSound: 'none',
        endCallPhrases: ['thank you', 'bye', 'that\'s all'],
        summaryPrompt: 'Summarize NPS score and key feedback themes.',
        successEvalPrompt: 'Did the user complete the full survey?',
        responseDelay: 0,
        endpointingMs: 400,
    },
    {
        id: 'asst_06',
        name: 'Real Estate Agent',
        firstMessage: "Hi there! I'm calling about the property listing you showed interest in. Are you still looking?",
        systemPrompt: `You are a real estate assistant specializing in property inquiries. Answer questions about listings, schedule viewings, and collect buyer preferences.`,
        llmProvider: 'anthropic',
        model: 'claude-3-haiku',
        temperature: 0.7,
        maxTokens: 450,
        voiceProvider: 'elevenlabs',
        voiceId: 'josh',
        voiceName: 'Josh',
        voiceSpeed: 1.0,
        transcriberProvider: 'deepgram',
        transcriberModel: 'nova-2',
        language: 'en',
        status: 'active',
        callCount: 672,
        lastActive: subHours(new Date(), 8).toISOString(),
        createdAt: subDays(new Date(), 20).toISOString(),
        backgroundDenoising: true,
        recording: true,
        hipaaMode: false,
        backgroundSound: 'office',
        endCallPhrases: ['goodbye', 'have a great day'],
        summaryPrompt: 'Summarize property interests, budget, and viewing schedule.',
        successEvalPrompt: 'Was a property viewing scheduled?',
        responseDelay: 150,
        endpointingMs: 550,
    },
    {
        id: 'asst_07',
        name: 'Debt Collection Agent',
        firstMessage: "Hello, I'm calling from Accounts Receivable regarding an outstanding balance. Is this [Customer Name]?",
        systemPrompt: `You are a polite but firm debt collection specialist. Follow FDCPA guidelines strictly. Offer payment plans and settlement options.`,
        llmProvider: 'openai',
        model: 'gpt-4o',
        temperature: 0.4,
        maxTokens: 400,
        voiceProvider: 'cartesia',
        voiceId: 'brit',
        voiceName: 'Brit',
        voiceSpeed: 0.9,
        transcriberProvider: 'deepgram',
        transcriberModel: 'nova-2',
        language: 'en',
        status: 'inactive',
        callCount: 289,
        lastActive: subDays(new Date(), 7).toISOString(),
        createdAt: subDays(new Date(), 55).toISOString(),
        backgroundDenoising: true,
        recording: true,
        hipaaMode: false,
        backgroundSound: 'none',
        endCallPhrases: ['goodbye', 'thank you'],
        summaryPrompt: 'Summarize payment commitment or dispute raised.',
        successEvalPrompt: 'Did the customer agree to a payment arrangement?',
        responseDelay: 200,
        endpointingMs: 500,
    },
];

export const mockPhoneNumbers: PhoneNumber[] = [
    {
        id: 'pn_01',
        number: '+14155552671',
        provider: 'twilio',
        label: 'Main Support Line',
        assignedAssistantId: 'asst_01',
        inboundCount: 8420,
        outboundCount: 234,
        monthlyCost: 2.00,
        status: 'active',
        createdAt: subDays(new Date(), 90).toISOString(),
        webhookUrl: 'https://api.myapp.com/webhooks/calls',
        forwardingEnabled: false,
        forwardingNumber: '',
    },
    {
        id: 'pn_02',
        number: '+12125559834',
        provider: 'twilio',
        label: 'Sales Outbound',
        assignedAssistantId: 'asst_02',
        inboundCount: 120,
        outboundCount: 3410,
        monthlyCost: 2.00,
        status: 'active',
        createdAt: subDays(new Date(), 60).toISOString(),
        webhookUrl: '',
        forwardingEnabled: false,
        forwardingNumber: '',
    },
    {
        id: 'pn_03',
        number: '+13105557290',
        provider: 'vonage',
        label: 'Medical Scheduler',
        assignedAssistantId: 'asst_03',
        inboundCount: 5621,
        outboundCount: 890,
        monthlyCost: 1.50,
        status: 'active',
        createdAt: subDays(new Date(), 120).toISOString(),
        webhookUrl: 'https://api.medcenter.com/voice/webhook',
        forwardingEnabled: true,
        forwardingNumber: '+18005551234',
    },
];

const callStatuses: CallStatus[] = ['ended', 'ended', 'ended', 'ended', 'ended', 'failed', 'busy', 'no-answer'];
const assistantNames = mockAssistants.map(a => ({ id: a.id, name: a.name }));

function generateTranscript(assistantName: string): CallTranscriptEntry[] {
    return [
        { id: '1', speaker: 'assistant', text: `Hello! This is ${assistantName}. How can I help you today?`, timestamp: 0, sentiment: 'neutral' },
        { id: '2', speaker: 'user', text: 'Hi, I have a question about my account.', timestamp: 4, sentiment: 'neutral' },
        { id: '3', speaker: 'assistant', text: "Of course! I'd be happy to help with your account. Can you please verify your name and account email?", timestamp: 7, sentiment: 'positive' },
        { id: '4', speaker: 'user', text: 'Sure, my name is John and the email is john@example.com.', timestamp: 13, sentiment: 'neutral' },
        { id: '5', speaker: 'assistant', text: "Thank you, John! I've located your account. What specifically did you need help with?", timestamp: 17, sentiment: 'positive' },
        { id: '6', speaker: 'user', text: "I'm having trouble accessing my dashboard. It keeps showing an error when I try to log in.", timestamp: 22, sentiment: 'negative' },
        { id: '7', speaker: 'assistant', text: "I understand that's frustrating. Let me check the recent activity on your account... I can see there were a few failed login attempts. Have you tried resetting your password recently?", timestamp: 29, sentiment: 'neutral' },
        { id: '8', speaker: 'user', text: "No, I haven't. Should I do that?", timestamp: 39, sentiment: 'neutral' },
        { id: '9', speaker: 'assistant', text: "Yes, that should resolve access. I'll send a password reset link to john@example.com right now. You should receive it within a minute.", timestamp: 43, sentiment: 'positive' },
        { id: '10', speaker: 'user', text: "Great, thank you so much!", timestamp: 51, sentiment: 'positive' },
        { id: '11', speaker: 'assistant', text: "You're welcome! Is there anything else I can help you with today?", timestamp: 54, sentiment: 'positive' },
        { id: '12', speaker: 'user', text: "No, that's all. Have a great day!", timestamp: 57, sentiment: 'positive' },
        { id: '13', speaker: 'assistant', text: "You too! Thank you for calling. Goodbye!", timestamp: 60, sentiment: 'positive' },
    ];
}

export function generateMockCalls(): Call[] {
    const calls: Call[] = [];
    const fromNumbers = ['+14155551234', '+12125550987', '+18005559876', '+17325554321'];

    for (let i = 0; i < 220; i++) {
        const assistant = assistantNames[Math.floor(Math.random() * assistantNames.length)];
        const status = callStatuses[Math.floor(Math.random() * callStatuses.length)];
        const direction: CallDirection = Math.random() > 0.4 ? 'inbound' : 'outbound';
        const duration = status === 'ended' ? Math.floor(30 + Math.random() * 300) : 0;
        const startedAt = subMinutes(new Date(), Math.floor(Math.random() * 43200)).toISOString();
        const llmCost = duration * 0.0002;
        const ttsCost = duration * 0.0001;
        const sstCost = duration * 0.00005;
        const telCost = duration * 0.00013;
        const totalCost = +(llmCost + ttsCost + sstCost + telCost).toFixed(4);

        calls.push({
            id: `call_${String(i + 1).padStart(5, '0')}`,
            direction,
            status,
            assistantId: assistant.id,
            assistantName: assistant.name,
            fromNumber: direction === 'inbound' ? fromNumbers[Math.floor(Math.random() * fromNumbers.length)] : mockPhoneNumbers[Math.floor(Math.random() * mockPhoneNumbers.length)].number,
            toNumber: direction === 'outbound' ? fromNumbers[Math.floor(Math.random() * fromNumbers.length)] : mockPhoneNumbers[Math.floor(Math.random() * mockPhoneNumbers.length)].number,
            phoneNumberId: mockPhoneNumbers[Math.floor(Math.random() * mockPhoneNumbers.length)].id,
            duration,
            cost: totalCost,
            startedAt,
            endedAt: new Date(new Date(startedAt).getTime() + duration * 1000).toISOString(),
            transcript: status === 'ended' ? generateTranscript(assistant.name) : [],
            summary: status === 'ended' ? 'Customer issue was resolved successfully. Password reset link was sent.' : undefined,
            successEval: status === 'ended' ? Math.random() > 0.2 : undefined,
            metadata: {},
            latency: {
                llm: Math.floor(200 + Math.random() * 600),
                tts: Math.floor(80 + Math.random() * 200),
                stt: Math.floor(50 + Math.random() * 150),
            },
            costBreakdown: {
                llm: +llmCost.toFixed(4),
                tts: +ttsCost.toFixed(4),
                stt: +sstCost.toFixed(4),
                telephony: +telCost.toFixed(4),
            },
        });
    }

    return calls.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export const mockSquads: Squad[] = [
    {
        id: 'squad_01',
        name: 'Customer Service Team',
        description: 'Routes customers through support, escalates to sales when opportunities arise.',
        members: [
            { assistantId: 'asst_01', assistantName: 'SupportBot Pro', transferCondition: 'Customer shows purchase intent', targetAssistantId: 'asst_02' },
            { assistantId: 'asst_02', assistantName: 'Sales Qualifier' },
        ],
        defaultAssistantId: 'asst_01',
        callCount: 342,
        createdAt: subDays(new Date(), 30).toISOString(),
    },
    {
        id: 'squad_02',
        name: 'Healthcare Intake Flow',
        description: 'Handles patient intake, appointment scheduling, and follow-up surveys.',
        members: [
            { assistantId: 'asst_03', assistantName: 'Appointment Scheduler', transferCondition: 'After appointment confirmed', targetAssistantId: 'asst_05' },
            { assistantId: 'asst_05', assistantName: 'Survey Collector' },
        ],
        defaultAssistantId: 'asst_03',
        callCount: 891,
        createdAt: subDays(new Date(), 60).toISOString(),
    },
];

export const mockTools: Tool[] = [
    {
        id: 'tool_01',
        name: 'get_calendar_availability',
        description: 'Fetches available time slots from the calendar system for appointment scheduling.',
        url: 'https://api.calendly.com/v2/availability',
        method: 'GET',
        headers: [{ key: 'Authorization', value: 'Bearer {{CALENDLY_TOKEN}}' }],
        bodyTemplate: '',
        parametersSchema: JSON.stringify({
            type: 'object',
            properties: {
                date: { type: 'string', description: 'The date to check in YYYY-MM-DD format' },
                duration: { type: 'number', description: 'Duration in minutes' },
            },
            required: ['date'],
        }, null, 2),
        timeout: 10,
        callCount: 4521,
        lastUsed: subHours(new Date(), 1).toISOString(),
        createdAt: subDays(new Date(), 90).toISOString(),
    },
    {
        id: 'tool_02',
        name: 'create_support_ticket',
        description: 'Creates a new support ticket in the CRM system with customer details and issue description.',
        url: 'https://api.zendesk.com/v2/tickets',
        method: 'POST',
        headers: [
            { key: 'Authorization', value: 'Basic {{ZENDESK_TOKEN}}' },
            { key: 'Content-Type', value: 'application/json' },
        ],
        bodyTemplate: '{"ticket": {"subject": "{{subject}}", "body": "{{body}}", "priority": "normal"}}',
        parametersSchema: JSON.stringify({
            type: 'object',
            properties: {
                subject: { type: 'string', description: 'Brief subject of the issue' },
                body: { type: 'string', description: 'Full description of the issue' },
                priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
            },
            required: ['subject', 'body'],
        }, null, 2),
        timeout: 15,
        callCount: 2103,
        lastUsed: subMinutes(new Date(), 30).toISOString(),
        createdAt: subDays(new Date(), 60).toISOString(),
    },
    {
        id: 'tool_03',
        name: 'send_sms_notification',
        description: 'Sends an SMS message to the caller with summary or next steps.',
        url: 'https://api.twilio.com/2010-04-01/Accounts/{{ACCOUNT_SID}}/Messages',
        method: 'POST',
        headers: [{ key: 'Authorization', value: 'Basic {{TWILIO_AUTH}}' }],
        bodyTemplate: 'To={{to}}&From={{from}}&Body={{body}}',
        parametersSchema: JSON.stringify({
            type: 'object',
            properties: {
                to: { type: 'string', description: 'Recipient phone number in E.164 format' },
                body: { type: 'string', description: 'Message body (max 160 chars)' },
            },
            required: ['to', 'body'],
        }, null, 2),
        timeout: 10,
        callCount: 1876,
        lastUsed: subHours(new Date(), 3).toISOString(),
        createdAt: subDays(new Date(), 45).toISOString(),
    },
];

export const mockFiles: FileRecord[] = [
    {
        id: 'file_01',
        name: 'product-documentation.pdf',
        size: 2457600,
        type: 'application/pdf',
        uploadedAt: subDays(new Date(), 15).toISOString(),
        status: 'ready',
        usageCount: 4,
        url: '#',
    },
    {
        id: 'file_02',
        name: 'faq-knowledge-base.txt',
        size: 52400,
        type: 'text/plain',
        uploadedAt: subDays(new Date(), 8).toISOString(),
        status: 'ready',
        usageCount: 7,
        url: '#',
    },
    {
        id: 'file_03',
        name: 'pricing-tiers-2026.pdf',
        size: 890000,
        type: 'application/pdf',
        uploadedAt: subDays(new Date(), 3).toISOString(),
        status: 'ready',
        usageCount: 2,
        url: '#',
    },
    {
        id: 'file_04',
        name: 'onboarding-guide.docx',
        size: 1200000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: subDays(new Date(), 1).toISOString(),
        status: 'processing',
        usageCount: 0,
        url: '#',
    },
];

export const mockApiKeys: ApiKey[] = [
    {
        id: 'key_01',
        name: 'Production API Key',
        keyPrefix: 'sprio_live',
        keyMasked: 'sprio_live_••••••••••••••••••••8f3a',
        fullKey: 'sprio_live_9x8y7z6w5v4u3t2s1r0q_8f3a',
        permissions: ['read', 'write'],
        createdAt: subDays(new Date(), 60).toISOString(),
        lastUsed: subMinutes(new Date(), 5).toISOString(),
        expiresAt: null,
        revoked: false,
    },
    {
        id: 'key_02',
        name: 'Dev / Staging Key',
        keyPrefix: 'sprio_test',
        keyMasked: 'sprio_test_••••••••••••••••••••2b9c',
        fullKey: 'sprio_test_abc123def456ghi789_2b9c',
        permissions: ['read', 'write', 'admin'],
        createdAt: subDays(new Date(), 30).toISOString(),
        lastUsed: subHours(new Date(), 2).toISOString(),
        expiresAt: null,
        revoked: false,
    },
    {
        id: 'key_03',
        name: 'Read-Only Analytics Key',
        keyPrefix: 'sprio_live',
        keyMasked: 'sprio_live_••••••••••••••••••••7d1e',
        fullKey: 'sprio_live_xyz987uvw654rst321_7d1e',
        permissions: ['read'],
        createdAt: subDays(new Date(), 10).toISOString(),
        lastUsed: null,
        expiresAt: subDays(new Date(), -60).toISOString(),
        revoked: false,
    },
];

export function generateAnalyticsData() {
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const calls = Math.floor(40 + Math.random() * 120);
        const minutes = Math.floor(calls * (1.5 + Math.random() * 3));
        const cost = +(minutes * 0.018 + Math.random() * 5).toFixed(2);
        const successRate = +(75 + Math.random() * 20).toFixed(1);
        return {
            date: format(date, 'MMM d'),
            calls,
            minutes,
            cost,
            successRate,
        };
    });

    const hourlyData = Array.from({ length: 24 }, (_, hour) =>
        Array.from({ length: 7 }, (_, day) => ({
            hour,
            day,
            value: Math.floor(Math.random() * 50),
        }))
    ).flat();

    return { days, hourlyData };
}
