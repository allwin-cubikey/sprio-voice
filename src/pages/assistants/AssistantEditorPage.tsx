import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Play, Mic, MicOff, PhoneOff, X } from 'lucide-react';
import { useAssistantStore, useToastStore } from '@/store';
import { Assistant, LLMProvider } from '@/data/mockData';
import { WaveformVisualizer } from '@/components/ui/index';
import { clsx } from 'clsx';
import { delay } from '@/store';

const TABS = ['Knowledge Base', 'Voice Library'];

const LLM_MODELS: Record<LLMProvider, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet', 'claude-3-haiku', 'claude-3-opus'],
    together: ['llama-3-70b', 'mixtral-8x7b', 'codellama-34b'],
    groq: ['llama-3-70b-groq', 'mixtral-8x7b-groq', 'gemma-7b'],
    custom: ['custom-model'],
};

const VOICES = [
    { id: 'rachel', name: 'Rachel', provider: 'ElevenLabs', gender: 'Female', accent: 'American' },
    { id: 'adam', name: 'Adam', provider: 'ElevenLabs', gender: 'Male', accent: 'American' },
    { id: 'bella', name: 'Bella', provider: 'ElevenLabs', gender: 'Female', accent: 'British' },
    { id: 'josh', name: 'Josh', provider: 'ElevenLabs', gender: 'Male', accent: 'American' },
    { id: 'aria', name: 'Aria', provider: 'PlayHT', gender: 'Female', accent: 'American' },
    { id: 'nova', name: 'Nova', provider: 'OpenAI', gender: 'Female', accent: 'American' },
    { id: 'alloy', name: 'Alloy', provider: 'OpenAI', gender: 'Neutral', accent: 'American' },
    { id: 'echo', name: 'Echo', provider: 'OpenAI', gender: 'Male', accent: 'American' },
    { id: 'fable', name: 'Fable', provider: 'OpenAI', gender: 'Neutral', accent: 'British' },
];

function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
    return active ? <div className="animate-fade-in">{children}</div> : null;
}

// Live Test Widget
function LiveTestWidget({ assistantName }: { assistantName: string }) {
    const [open, setOpen] = useState(false);
    const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'assistant'; text: string }[]>([]);
    const [duration, setDuration] = useState(0);

    const demoLines = [
        { speaker: 'assistant' as const, text: `Hello! I'm ${assistantName}. How can I help you today?` },
        { speaker: 'user' as const, text: "I'd like to test your capabilities." },
        { speaker: 'assistant' as const, text: "Of course! I'm ready to demonstrate. What would you like to explore?" },
        { speaker: 'user' as const, text: "Can you handle appointment scheduling?" },
        { speaker: 'assistant' as const, text: "Absolutely! I can check availability, book appointments, send confirmations, and handle rescheduling — all through natural conversation." },
    ];

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (callState === 'active') timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, [callState]);

    const startTest = async () => {
        setTranscript([]);
        setDuration(0);
        setCallState('connecting');
        await delay(1500);
        setCallState('active');
        for (let i = 0; i < demoLines.length; i++) {
            await delay(2500);
            setTranscript(prev => [...prev, demoLines[i]]);
        }
    };

    const endTest = () => {
        setCallState('ended');
        setTimeout(() => { setCallState('idle'); setTranscript([]); }, 1000);
    };

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <>
            <button onClick={() => setOpen(true)} className="btn-secondary flex items-center gap-1.5">
                <Play className="w-4 h-4" /> Test
            </button>
            {open && (
                <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => callState === 'idle' && setOpen(false)} />
                    <div className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-sm font-semibold text-text-primary">Live Test — {assistantName}</h3>
                            <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {callState === 'idle' && (
                                <div className="text-center py-4">
                                    <WaveformVisualizer active={false} bars={10} size="lg" className="justify-center mb-4" />
                                    <p className="text-sm text-text-muted mb-4">Simulate a call with this assistant to test its responses.</p>
                                    <button onClick={startTest} className="btn-primary flex items-center gap-2 mx-auto">
                                        <Mic className="w-4 h-4" /> Start Test Call
                                    </button>
                                </div>
                            )}
                            {(callState === 'connecting' || callState === 'active') && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        {callState === 'connecting' && <p className="text-sm text-warning">Connecting...</p>}
                                        {callState === 'active' && (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                                <span className="text-sm text-success font-mono">{fmt(duration)}</span>
                                            </div>
                                        )}
                                        <WaveformVisualizer active={callState === 'active'} bars={12} size="md" className="justify-center mt-2" />
                                    </div>
                                    <div className="bg-background rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                        {transcript.length === 0 && <p className="text-xs text-text-muted text-center">Waiting for response...</p>}
                                        {transcript.map((line, i) => (
                                            <div key={i} className={clsx('flex gap-2', line.speaker === 'user' && 'justify-end')}>
                                                <div className={clsx('px-3 py-1.5 rounded-lg text-xs max-w-[80%]',
                                                    line.speaker === 'assistant' ? 'bg-accent/10 text-text-secondary' : 'bg-white/10 text-text-primary')}>
                                                    <span className="font-medium text-[10px] block mb-0.5">
                                                        {line.speaker === 'assistant' ? assistantName : 'You'}
                                                    </span>
                                                    {line.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-center">
                                        <button onClick={endTest} className="p-3 rounded-full bg-error hover:bg-error/80 text-white transition-colors">
                                            <PhoneOff className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {callState === 'ended' && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-success">✅ Test call ended</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export function AssistantEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { assistants, createAssistant, updateAssistant } = useAssistantStore();
    const { addToast } = useToastStore();
    const [activeTab, setActiveTab] = useState(0);
    const [saving, setSaving] = useState(false);

    const isNew = id === 'new';
    const existing = assistants.find(a => a.id === id);

    const [form, setForm] = useState<Partial<Assistant>>(existing || {
        name: 'My New Assistant',
        firstMessage: 'Hello! How can I help you today?',
        systemPrompt: 'You are a helpful AI voice assistant. Be concise and friendly.',
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
        backgroundDenoising: true,
        recording: true,
        hipaaMode: false,
        backgroundSound: 'none',
        endCallPhrases: ['goodbye', 'bye'],
        summaryPrompt: 'Summarize the key points from this call.',
        successEvalPrompt: 'Was the caller\'s main question or issue resolved?',
        responseDelay: 0,
        endpointingMs: 500,
        status: 'active',
    });

    const set = (key: keyof Assistant, value: any) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        await delay(600);
        if (isNew) {
            await createAssistant(form);
            addToast('Assistant created!', 'success');
        } else {
            await updateAssistant(id!, form);
            addToast('Changes saved', 'success');
        }
        setSaving(false);
        if (isNew) navigate('/assistants');
    };

    return (
        <div className="space-y-5 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/assistants')} className="text-text-muted hover:text-text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">{isNew ? 'Create Assistant' : form.name}</h1>
                        <p className="text-xs text-text-muted">{isNew ? 'Configure your new voice agent' : `Last active: ${existing ? new Date(existing.lastActive).toLocaleString() : 'N/A'}`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <LiveTestWidget assistantName={form.name || 'Assistant'} />
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tab-nav">
                {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)} className={`tab-btn ${activeTab === i ? 'active' : ''}`}>{tab}</button>
                ))}
            </div>

            {/* Tab: Model */}
            <TabPanel active={activeTab === 0}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Assistant Name</label>
                            <input className="input" value={form.name || ''} onChange={e => set('name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">First Message</label>
                            <p className="text-xs text-text-muted">What the assistant says when the call starts</p>
                            <textarea className="input min-h-[80px] resize-none" value={form.firstMessage || ''} onChange={e => set('firstMessage', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">System Prompt</label>
                            <p className="text-xs text-text-muted">Instructions for how the assistant should behave</p>
                            <textarea className="input font-mono text-xs min-h-[160px] resize-vertical" value={form.systemPrompt || ''} onChange={e => set('systemPrompt', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">LLM Provider</label>
                            <select className="input" value={form.llmProvider} onChange={e => { set('llmProvider', e.target.value as LLMProvider); set('model', LLM_MODELS[e.target.value as LLMProvider][0]); }}>
                                {['openai', 'anthropic', 'together', 'groq', 'custom'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <select className="input" value={form.model} onChange={e => set('model', e.target.value)}>
                                {(LLM_MODELS[form.llmProvider as LLMProvider] || []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label flex justify-between"><span>Temperature</span><span className="text-accent font-mono">{form.temperature}</span></label>
                            <input type="range" min="0" max="2" step="0.1" value={form.temperature} onChange={e => set('temperature', parseFloat(e.target.value))}
                                className="w-full accent-accent" />
                            <div className="flex justify-between text-[10px] text-text-muted">
                                <span>Focused (0)</span><span>Creative (2)</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Tokens</label>
                            <input type="number" className="input" value={form.maxTokens} onChange={e => set('maxTokens', parseInt(e.target.value))} min={64} max={4096} />
                        </div>
                        <div className="card p-3 border-dashed">
                            <p className="text-xs font-medium text-text-secondary mb-2">Knowledge Base</p>
                            <p className="text-xs text-text-muted mb-2">Attach files to give the assistant knowledge about your product or business.</p>
                            <button className="btn-secondary text-xs w-full">+ Attach Files</button>
                        </div>
                    </div>
                </div>
            </TabPanel>

            {/* Tab: Voice */}
            <TabPanel active={activeTab === 1}>
                <div className="space-y-5">
                    <div className="form-group max-w-sm">
                        <label className="form-label flex justify-between"><span>Voice Speed</span><span className="text-accent font-mono">{form.voiceSpeed}x</span></label>
                        <input type="range" min="0.5" max="2" step="0.05" value={form.voiceSpeed} onChange={e => set('voiceSpeed', parseFloat(e.target.value))} className="w-full accent-accent mt-3" />
                        <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>Slower (0.5x)</span><span>Faster (2x)</span></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Voice Selection</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-1">
                            {VOICES.map(voice => (
                                <button
                                    key={voice.id}
                                    onClick={() => { set('voiceId', voice.id); set('voiceName', voice.name); }}
                                    className={clsx('p-3 rounded-lg border text-left transition-all', form.voiceId === voice.id ? 'border-accent bg-accent/10' : 'border-border bg-card hover:border-accent/50')}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium text-text-primary">{voice.name}</span>
                                        {form.voiceId === voice.id && <WaveformVisualizer active bars={4} size="sm" />}
                                    </div>
                                    <p className="text-[10px] text-text-muted">{voice.gender} · {voice.accent}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 card">
                        <div>
                            <p className="text-sm font-medium text-text-primary">Background Denoising</p>
                            <p className="text-xs text-text-muted">Reduce background noise in calls</p>
                        </div>
                        <button onClick={() => set('backgroundDenoising', !form.backgroundDenoising)}
                            className={clsx('w-10 h-5 rounded-full transition-colors relative', form.backgroundDenoising ? 'bg-accent' : 'bg-border')}>
                            <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.backgroundDenoising ? 'left-5' : 'left-0.5')} />
                        </button>
                    </div>
                </div>
            </TabPanel>

            {/* Tab: Transcriber */}
            <TabPanel active={activeTab === 2}>
                <div className="space-y-4 max-w-xl">
                    <div className="form-group">
                        <label className="form-label">Transcription Provider</label>
                        <select className="input" value={form.transcriberProvider} onChange={e => set('transcriberProvider', e.target.value as any)}>
                            <option value="deepgram">Deepgram</option>
                            <option value="assemblyai">AssemblyAI</option>
                            <option value="talkscriber">Talkscriber</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Model</label>
                        <select className="input" value={form.transcriberModel} onChange={e => set('transcriberModel', e.target.value)}>
                            {form.transcriberProvider === 'deepgram' && ['nova-2', 'nova', 'enhanced', 'base'].map(m => <option key={m}>{m}</option>)}
                            {form.transcriberProvider === 'assemblyai' && ['best', 'nano'].map(m => <option key={m}>{m}</option>)}
                            {form.transcriberProvider === 'talkscriber' && ['whisper'].map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Language</label>
                        <select className="input" value={form.language} onChange={e => set('language', e.target.value)}>
                            {[['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese'], ['hi', 'Hindi']].map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label flex justify-between"><span>Endpointing</span><span className="text-accent font-mono">{form.endpointingMs}ms</span></label>
                        <p className="text-xs text-text-muted">How long to wait for silence before ending the user's turn</p>
                        <input type="range" min="100" max="2000" step="50" value={form.endpointingMs} onChange={e => set('endpointingMs', parseInt(e.target.value))} className="w-full accent-accent mt-1" />
                    </div>
                </div>
            </TabPanel>

        </div>
    );
}
