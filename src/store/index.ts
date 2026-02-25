import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Assistant, Call, PhoneNumber, Squad, Tool, FileRecord, ApiKey,
    mockAssistants, mockPhoneNumbers, generateMockCalls, mockSquads, mockTools, mockFiles, mockApiKeys
} from '@/data/mockData';
export { useAuthStore } from './auth';
export type { AuthUser } from './auth';
import { delay } from './auth';
export { delay } from './auth';



// ─── Assistant Store ─────────────────────────────────────────────────────────
interface AssistantStore {
    assistants: Assistant[];
    loading: boolean;
    fetchAssistants: () => Promise<void>;
    createAssistant: (data: Partial<Assistant>) => Promise<Assistant>;
    updateAssistant: (id: string, data: Partial<Assistant>) => Promise<void>;
    deleteAssistant: (id: string) => Promise<void>;
    duplicateAssistant: (id: string) => Promise<void>;
}

export const useAssistantStore = create<AssistantStore>()(
    persist(
        (set, get) => ({
            assistants: mockAssistants,
            loading: false,
            fetchAssistants: async () => {
                set({ loading: true });
                await delay(400);
                set({ loading: false });
            },
            createAssistant: async (data) => {
                await delay(600);
                const newAssistant: Assistant = {
                    id: `asst_${Date.now()}`,
                    name: 'New Assistant',
                    firstMessage: 'Hello! How can I help you today?',
                    systemPrompt: 'You are a helpful AI assistant.',
                    llmProvider: 'openai',
                    model: 'gpt-4o-mini',
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
                    callCount: 0,
                    lastActive: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    backgroundDenoising: true,
                    recording: true,
                    hipaaMode: false,
                    backgroundSound: 'none',
                    endCallPhrases: ['goodbye', 'bye'],
                    summaryPrompt: 'Summarize this call.',
                    successEvalPrompt: 'Was this call successful?',
                    responseDelay: 0,
                    endpointingMs: 500,
                    ...data,
                };
                set(s => ({ assistants: [newAssistant, ...s.assistants] }));
                return newAssistant;
            },
            updateAssistant: async (id, data) => {
                await delay(400);
                set(s => ({
                    assistants: s.assistants.map(a => a.id === id ? { ...a, ...data } : a),
                }));
            },
            deleteAssistant: async (id) => {
                await delay(400);
                set(s => ({ assistants: s.assistants.filter(a => a.id !== id) }));
            },
            duplicateAssistant: async (id) => {
                await delay(400);
                const original = get().assistants.find(a => a.id === id);
                if (!original) return;
                const dupe: Assistant = { ...original, id: `asst_${Date.now()}`, name: `${original.name} (Copy)`, callCount: 0, createdAt: new Date().toISOString() };
                set(s => ({ assistants: [dupe, ...s.assistants] }));
            },
        }),
        { name: 'sprio-assistants', version: 1 }
    )
);

// ─── Call Store ──────────────────────────────────────────────────────────────
interface CallStore {
    calls: Call[];
    loading: boolean;
    fetchCalls: () => Promise<void>;
}

export const useCallStore = create<CallStore>()(
    persist(
        (set) => ({
            calls: generateMockCalls(),
            loading: false,
            fetchCalls: async () => {
                set({ loading: true });
                await delay(500);
                set({ loading: false });
            },
        }),
        { name: 'sprio-calls', version: 1 }
    )
);

// ─── Phone Number Store ──────────────────────────────────────────────────────
interface PhoneNumberStore {
    phoneNumbers: PhoneNumber[];
    loading: boolean;
    fetchPhoneNumbers: () => Promise<void>;
    createPhoneNumber: (data: Partial<PhoneNumber>) => Promise<void>;
    updatePhoneNumber: (id: string, data: Partial<PhoneNumber>) => Promise<void>;
    deletePhoneNumber: (id: string) => Promise<void>;
}

export const usePhoneNumberStore = create<PhoneNumberStore>()(
    persist(
        (set) => ({
            phoneNumbers: mockPhoneNumbers,
            loading: false,
            fetchPhoneNumbers: async () => {
                set({ loading: true });
                await delay(400);
                set({ loading: false });
            },
            createPhoneNumber: async (data) => {
                await delay(600);
                const newPN: PhoneNumber = {
                    id: `pn_${Date.now()}`,
                    number: '+10000000000',
                    provider: 'twilio',
                    label: 'New Number',
                    assignedAssistantId: null,
                    inboundCount: 0,
                    outboundCount: 0,
                    monthlyCost: 2.00,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    webhookUrl: '',
                    forwardingEnabled: false,
                    forwardingNumber: '',
                    ...data,
                };
                set(s => ({ phoneNumbers: [newPN, ...s.phoneNumbers] }));
            },
            updatePhoneNumber: async (id, data) => {
                await delay(400);
                set(s => ({
                    phoneNumbers: s.phoneNumbers.map(p => p.id === id ? { ...p, ...data } : p),
                }));
            },
            deletePhoneNumber: async (id) => {
                await delay(400);
                set(s => ({ phoneNumbers: s.phoneNumbers.filter(p => p.id !== id) }));
            },
        }),
        { name: 'sprio-phone-numbers', version: 1 }
    )
);

// ─── Squad Store ─────────────────────────────────────────────────────────────
interface SquadStore {
    squads: Squad[];
    loading: boolean;
    fetchSquads: () => Promise<void>;
    createSquad: (data: Partial<Squad>) => Promise<Squad>;
    updateSquad: (id: string, data: Partial<Squad>) => Promise<void>;
    deleteSquad: (id: string) => Promise<void>;
}

export const useSquadStore = create<SquadStore>()(
    persist(
        (set) => ({
            squads: mockSquads,
            loading: false,
            fetchSquads: async () => {
                set({ loading: true });
                await delay(400);
                set({ loading: false });
            },
            createSquad: async (data) => {
                await delay(600);
                const newSquad: Squad = {
                    id: `squad_${Date.now()}`,
                    name: 'New Squad',
                    description: '',
                    members: [],
                    defaultAssistantId: '',
                    callCount: 0,
                    createdAt: new Date().toISOString(),
                    ...data,
                };
                set(s => ({ squads: [newSquad, ...s.squads] }));
                return newSquad;
            },
            updateSquad: async (id, data) => {
                await delay(400);
                set(s => ({ squads: s.squads.map(q => q.id === id ? { ...q, ...data } : q) }));
            },
            deleteSquad: async (id) => {
                await delay(400);
                set(s => ({ squads: s.squads.filter(q => q.id !== id) }));
            },
        }),
        { name: 'sprio-squads', version: 1 }
    )
);

// ─── Tool Store ──────────────────────────────────────────────────────────────
interface ToolStore {
    tools: Tool[];
    loading: boolean;
    fetchTools: () => Promise<void>;
    createTool: (data: Partial<Tool>) => Promise<Tool>;
    updateTool: (id: string, data: Partial<Tool>) => Promise<void>;
    deleteTool: (id: string) => Promise<void>;
}

export const useToolStore = create<ToolStore>()(
    persist(
        (set) => ({
            tools: mockTools,
            loading: false,
            fetchTools: async () => {
                set({ loading: true });
                await delay(400);
                set({ loading: false });
            },
            createTool: async (data) => {
                await delay(600);
                const newTool: Tool = {
                    id: `tool_${Date.now()}`,
                    name: 'new_tool',
                    description: '',
                    url: '',
                    method: 'POST',
                    headers: [],
                    bodyTemplate: '',
                    parametersSchema: '{}',
                    timeout: 10,
                    callCount: 0,
                    lastUsed: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    ...data,
                };
                set(s => ({ tools: [newTool, ...s.tools] }));
                return newTool;
            },
            updateTool: async (id, data) => {
                await delay(400);
                set(s => ({ tools: s.tools.map(t => t.id === id ? { ...t, ...data } : t) }));
            },
            deleteTool: async (id) => {
                await delay(400);
                set(s => ({ tools: s.tools.filter(t => t.id !== id) }));
            },
        }),
        { name: 'sprio-tools', version: 1 }
    )
);

// ─── File Store ──────────────────────────────────────────────────────────────
interface FileStore {
    files: FileRecord[];
    loading: boolean;
    uploading: boolean;
    fetchFiles: () => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    deleteFile: (id: string) => Promise<void>;
}

export const useFileStore = create<FileStore>()(
    persist(
        (set, get) => ({
            files: mockFiles,
            loading: false,
            uploading: false,
            fetchFiles: async () => {
                set({ loading: true });
                await delay(400);
                set({ loading: false });
            },
            uploadFile: async (file) => {
                set({ uploading: true });
                const newFile: FileRecord = {
                    id: `file_${Date.now()}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString(),
                    status: 'processing',
                    usageCount: 0,
                    url: '#',
                };
                set(s => ({ files: [newFile, ...s.files], uploading: false }));
                // Simulate processing
                await delay(2000);
                set(s => ({
                    files: s.files.map(f => f.id === newFile.id ? { ...f, status: 'ready' } : f),
                }));
            },
            deleteFile: async (id) => {
                await delay(400);
                set(s => ({ files: s.files.filter(f => f.id !== id) }));
            },
        }),
        { name: 'sprio-files', version: 1 }
    )
);

// ─── API Key Store ───────────────────────────────────────────────────────────
interface ApiKeyStore {
    apiKeys: ApiKey[];
    loading: boolean;
    fetchApiKeys: () => Promise<void>;
    createApiKey: (data: Partial<ApiKey>) => Promise<ApiKey>;
    revokeApiKey: (id: string) => Promise<void>;
}

export const useApiKeyStore = create<ApiKeyStore>()(
    persist(
        (set) => ({
            apiKeys: mockApiKeys,
            loading: false,
            fetchApiKeys: async () => {
                set({ loading: true });
                await delay(400);
                set({ loading: false });
            },
            createApiKey: async (data) => {
                await delay(600);
                const newKey: ApiKey = {
                    id: `key_${Date.now()}`,
                    name: 'New Key',
                    keyPrefix: 'sprio_live',
                    keyMasked: 'sprio_live_••••••••••••••••••••xxxx',
                    fullKey: `sprio_live_${Math.random().toString(36).substring(2, 18)}_${Math.random().toString(36).substring(2, 6)}`,
                    permissions: ['read'],
                    createdAt: new Date().toISOString(),
                    lastUsed: null,
                    expiresAt: null,
                    revoked: false,
                    ...data,
                };
                set(s => ({ apiKeys: [newKey, ...s.apiKeys] }));
                return newKey;
            },
            revokeApiKey: async (id) => {
                await delay(400);
                set(s => ({
                    apiKeys: s.apiKeys.map(k => k.id === id ? { ...k, revoked: true } : k),
                }));
            },
        }),
        { name: 'sprio-apikeys', version: 1 }
    )
);

// ─── Toast Store ─────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = 'success') => {
        const id = `toast_${Date.now()}`;
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
            set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
        }, 4000);
    },
    removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

// ─── UI Store ────────────────────────────────────────────────────────────────
interface UIStore {
    sidebarCollapsed: boolean;
    commandPaletteOpen: boolean;
    outboundCallOpen: boolean;
    toggleSidebar: () => void;
    setCommandPaletteOpen: (open: boolean) => void;
    setOutboundCallOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarCollapsed: false,
    commandPaletteOpen: false,
    outboundCallOpen: false,
    toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    setOutboundCallOpen: (open) => set({ outboundCallOpen: open }),
}));
