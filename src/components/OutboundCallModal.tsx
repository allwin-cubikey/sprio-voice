import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, PhoneOff, Mic, MicOff } from 'lucide-react';
import { useUIStore, useAssistantStore, usePhoneNumberStore, useToastStore } from '@/store';
import { WaveformVisualizer } from './ui/index';
import { delay } from '@/store';

type CallState = 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'ended';

export function OutboundCallModal() {
    const { outboundCallOpen, setOutboundCallOpen } = useUIStore();
    const { assistants } = useAssistantStore();
    const { phoneNumbers } = usePhoneNumberStore();
    const { addToast } = useToastStore();
    const [selectedAssistant, setSelectedAssistant] = useState('');
    const [toNumber, setToNumber] = useState('');
    const [fromNumber, setFromNumber] = useState('');
    const [callState, setCallState] = useState<CallState>('idle');
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'assistant'; text: string }[]>([]);

    const demoTranscript = [
        { speaker: 'assistant' as const, text: "Hello! Thank you for calling. How can I assist you today?" },
        { speaker: 'user' as const, text: "Hi, I'm calling about my subscription." },
        { speaker: 'assistant' as const, text: "Of course! I'd be happy to help with your subscription. Could you please provide your account email?" },
        { speaker: 'user' as const, text: "Sure, it's demo@example.com" },
        { speaker: 'assistant' as const, text: "Perfect, I've found your account. What would you like to do with your subscription today?" },
    ];

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (callState === 'in-progress') {
            timer = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [callState]);

    const handleCall = async () => {
        if (!selectedAssistant || !toNumber) {
            addToast('Please select an assistant and enter a phone number', 'error');
            return;
        }
        setCallState('connecting');
        setTranscript([]);
        setDuration(0);
        await delay(1200);
        setCallState('ringing');
        await delay(2000);
        setCallState('in-progress');

        // Add transcript messages with delays
        for (let i = 0; i < demoTranscript.length; i++) {
            await delay(2000 + i * 500);
            setTranscript(prev => [...prev, demoTranscript[i]]);
        }
    };

    const handleHangup = () => {
        setCallState('ended');
        addToast(`Call ended — ${formatDuration(duration)}`, 'info');
        setTimeout(() => {
            setCallState('idle');
            setOutboundCallOpen(false);
        }, 1500);
    };

    const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <AnimatePresence>
            {outboundCallOpen && (
                <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => callState === 'idle' && setOutboundCallOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                                <Phone className="w-4 h-4 text-accent" /> Outbound Call
                            </h2>
                            <button onClick={() => callState === 'idle' && setOutboundCallOpen(false)} className="text-text-muted hover:text-text-primary">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {callState === 'idle' ? (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Select Assistant</label>
                                        <select className="input" value={selectedAssistant} onChange={e => setSelectedAssistant(e.target.value)}>
                                            <option value="">Choose an assistant...</option>
                                            {assistants.filter(a => a.status === 'active').map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">To Number</label>
                                        <input className="input" placeholder="+1 (555) 000-0000" value={toNumber} onChange={e => setToNumber(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">From Number</label>
                                        <select className="input" value={fromNumber} onChange={e => setFromNumber(e.target.value)}>
                                            <option value="">Select from number...</option>
                                            {phoneNumbers.map(p => (
                                                <option key={p.id} value={p.number}>{p.number} — {p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={handleCall} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                                        <Phone className="w-4 h-4" /> Initiate Call
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4 space-y-6">
                                    {/* Status */}
                                    <div className="space-y-2">
                                        <div className={`text-sm font-medium ${callState === 'in-progress' ? 'text-success' : 'text-warning'}`}>
                                            {callState === 'connecting' && '⏳ Connecting...'}
                                            {callState === 'ringing' && '📞 Ringing...'}
                                            {callState === 'in-progress' && '🔴 Live Call'}
                                            {callState === 'ended' && '✅ Call Ended'}
                                        </div>
                                        {callState === 'in-progress' && (
                                            <div className="text-2xl font-mono text-text-primary">{formatDuration(duration)}</div>
                                        )}
                                    </div>

                                    {/* Waveform */}
                                    <div className="flex justify-center">
                                        <WaveformVisualizer active={callState === 'in-progress'} bars={12} size="lg" />
                                    </div>

                                    {/* Live Transcript */}
                                    {transcript.length > 0 && (
                                        <div className="bg-background rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 text-left">
                                            {transcript.map((line, i) => (
                                                <div key={i} className={`text-xs ${line.speaker === 'assistant' ? 'text-accent' : 'text-text-secondary'}`}>
                                                    <span className="font-medium">{line.speaker === 'assistant' ? 'Assistant' : 'You'}: </span>
                                                    {line.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Controls */}
                                    {callState === 'in-progress' && (
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => setMuted(!muted)}
                                                className={`p-3 rounded-full transition-colors ${muted ? 'bg-error/20 text-error' : 'bg-white/10 text-text-primary hover:bg-white/20'}`}
                                            >
                                                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={handleHangup}
                                                className="p-4 rounded-full bg-error hover:bg-error/80 text-white transition-colors"
                                            >
                                                <PhoneOff className="w-6 h-6" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
