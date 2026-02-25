import React, { useState } from 'react';
import { BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { CodeBlock } from '@/components/ui/index';
import { clsx } from 'clsx';

const DOC_NAV = [
    { section: 'Getting Started', items: ['Quickstart', 'Authentication', 'Your First Assistant'] },
    { section: 'API Reference', items: ['Assistants', 'Phone Numbers', 'Calls', 'Squads', 'Tools', 'Files', 'Webhooks'] },
    { section: 'SDKs', items: ['Node.js SDK', 'Python SDK', 'Go SDK'] },
    { section: 'Guides', items: ['Building a Support Bot', 'Outbound Calling', 'HIPAA Compliance', 'Custom Voices'] },
];

const QUICKSTART_CODE = `import Sprio from '@sprio/sdk';

const client = new Sprio({
  apiKey: process.env.SPRIO_API_KEY,
});

// Create an assistant
const assistant = await client.assistants.create({
  name: 'My First Assistant',
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
  },
  voice: {
    provider: 'elevenlabs',
    voiceId: 'rachel',
  },
  firstMessage: 'Hello! How can I assist you today?',
  systemPrompt: 'You are a helpful assistant.',
});

console.log('Assistant created:', assistant.id);
// → "asst_xKm9Lw..."`;

const MAKE_CALL_CODE = `// Initiate an outbound call
const call = await client.calls.create({
  assistantId: 'asst_xKm9Lw...',
  phoneNumberId: 'pn_aBcD12...',
  customer: {
    number: '+14155550123',
  },
});

// Listen for call events via webhook
// POST https://your-server.com/webhook
// {
//   "type": "call.ended",
//   "call": {
//     "id": "call_00042",
//     "duration": 87,
//     "status": "ended",
//     "cost": 0.0156
//   }
// }`;

export function DocsPage() {
    const [activeSection, setActiveSection] = useState('Quickstart');

    return (
        <div className="flex gap-0 -m-6 min-h-[calc(100vh-57px)]">
            {/* Sidebar */}
            <div className="w-56 flex-shrink-0 border-r border-border p-4 pt-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-5">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-text-primary">Sprio Docs</span>
                </div>
                {DOC_NAV.map(({ section, items }) => (
                    <div key={section} className="mb-4">
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">{section}</p>
                        {items.map(item => (
                            <button key={item} onClick={() => setActiveSection(item)}
                                className={clsx('w-full text-left px-2 py-1.5 rounded text-sm transition-colors block',
                                    activeSection === item ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text-primary hover:bg-white/5')}>
                                {item}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {activeSection === 'Quickstart' && (
                    <div className="max-w-2xl space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary mb-2">Quickstart</h1>
                            <p className="text-text-secondary">Build your first AI voice assistant in under 5 minutes using the Sprio Voice API.</p>
                        </div>
                        <div className="card p-4 border-accent/20 bg-accent/5">
                            <p className="text-sm text-accent font-medium mb-1">Prerequisites</p>
                            <p className="text-sm text-text-secondary">You'll need a Sprio Voice API key. <a href="/api-keys" className="underline text-accent">Generate one here →</a></p>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-text-primary mb-2">1. Install the SDK</h2>
                            <CodeBlock code="npm install @sprio/sdk" language="bash" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-text-primary mb-2">2. Create an assistant</h2>
                            <CodeBlock code={QUICKSTART_CODE} language="javascript" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-text-primary mb-2">3. Make your first call</h2>
                            <CodeBlock code={MAKE_CALL_CODE} language="javascript" />
                        </div>
                        <div className="flex gap-3">
                            <a href="/assistants/new" className="btn-primary flex items-center gap-1.5 no-underline">
                                Create Assistant in UI
                            </a>
                            <button className="btn-secondary flex items-center gap-1.5">
                                <ExternalLink className="w-4 h-4" /> Open API Reference
                            </button>
                        </div>
                    </div>
                )}
                {activeSection === 'Authentication' && (
                    <div className="max-w-2xl space-y-5">
                        <h1 className="text-2xl font-bold text-text-primary">Authentication</h1>
                        <p className="text-text-secondary">All API requests require an API key passed in the Authorization header.</p>
                        <CodeBlock code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\\n  https://api.sprio.io/v1/assistants`} language="bash" />
                        <div className="card p-4 border-warning/20 bg-warning/5">
                            <p className="text-sm text-warning font-medium">⚠️ Keep your API keys secret</p>
                            <p className="text-sm text-text-secondary mt-1">Never expose API keys in client-side code or public repositories.</p>
                        </div>
                    </div>
                )}
                {!['Quickstart', 'Authentication'].includes(activeSection) && (
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-bold text-text-primary mb-3">{activeSection}</h1>
                        <p className="text-text-secondary mb-6">Documentation for {activeSection}.</p>
                        <div className="card p-6 border-dashed text-center py-12">
                            <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
                            <p className="text-sm text-text-muted">Full {activeSection} documentation coming soon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
