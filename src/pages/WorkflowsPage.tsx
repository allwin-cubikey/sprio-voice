import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus, Search, Upload, BookOpen, MoreVertical, Code2, Trash2, Copy,
    ArrowLeft, Save, Phone, GitBranch, MessageSquare, Globe, Zap,
    X, ZoomIn, ZoomOut, RotateCcw, Move, Lock, Unlock, ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WorkflowNode {
    id: string;
    type: 'conversation' | 'transfer' | 'api' | 'condition' | 'end' | 'start';
    x: number;
    y: number;
    title: string;
    prompt?: string;
    color: string;
}

interface WorkflowEdge {
    id: string;
    from: string;
    to: string;
    label?: string;
}

interface Workflow {
    id: string;
    name: string;
    stepCount: number;
    createdAt: string;
    updatedAt: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

// ── Mock Workflows ─────────────────────────────────────────────────────────────
const MOCK_WORKFLOWS: Workflow[] = [
    {
        id: 'wf_001',
        name: 'Appointment Scheduler',
        stepCount: 24,
        createdAt: '2026-02-24T09:00:00Z',
        updatedAt: '2026-02-24T14:30:00Z',
        nodes: [
            { id: 'n1', type: 'start', x: 340, y: 20, title: 'Start', color: '#6366f1' },
            { id: 'n2', type: 'conversation', x: 280, y: 120, title: 'Greet & Identify', prompt: 'Greet the caller and ask for their name and reason for calling.', color: '#6366f1' },
            { id: 'n3', type: 'condition', x: 120, y: 240, title: 'Existing Patient?', color: '#f59e0b' },
            { id: 'n4', type: 'conversation', x: 340, y: 240, title: 'New Patient Intake', prompt: 'Collect patient information: name, DOB, insurance.', color: '#6366f1' },
            { id: 'n5', type: 'conversation', x: 120, y: 360, title: 'Verify Identity', prompt: 'Verify the patient\'s date of birth and last four of SSN.', color: '#6366f1' },
            { id: 'n6', type: 'api', x: 340, y: 360, title: 'Check Availability', color: '#22c55e' },
            { id: 'n7', type: 'conversation', x: 220, y: 480, title: 'Book Appointment', prompt: 'Offer available slots and confirm the booking.', color: '#6366f1' },
            { id: 'n8', type: 'api', x: 220, y: 580, title: 'Send Confirmation SMS', color: '#22c55e' },
            { id: 'n9', type: 'end', x: 220, y: 680, title: 'End Call', color: '#ef4444' },
        ],
        edges: [
            { id: 'e1', from: 'n1', to: 'n2' },
            { id: 'e2', from: 'n2', to: 'n3', label: 'patient type?' },
            { id: 'e3', from: 'n3', to: 'n5', label: 'existing' },
            { id: 'e4', from: 'n3', to: 'n4', label: 'new' },
            { id: 'e5', from: 'n4', to: 'n6' },
            { id: 'e6', from: 'n5', to: 'n6' },
            { id: 'e7', from: 'n6', to: 'n7' },
            { id: 'e8', from: 'n7', to: 'n8' },
            { id: 'e9', from: 'n8', to: 'n9' },
        ],
    },
    {
        id: 'wf_002',
        name: 'Lead Qualification',
        stepCount: 12,
        createdAt: '2026-02-20T10:00:00Z',
        updatedAt: '2026-02-22T11:00:00Z',
        nodes: [
            { id: 'n1', type: 'start', x: 200, y: 20, title: 'Start', color: '#6366f1' },
            { id: 'n2', type: 'conversation', x: 160, y: 120, title: 'Introduce & Qualify', color: '#6366f1' },
            { id: 'n3', type: 'condition', x: 160, y: 240, title: 'Budget Qualified?', color: '#f59e0b' },
            { id: 'n4', type: 'transfer', x: 60, y: 360, title: 'Transfer to Sales', color: '#8b5cf6' },
            { id: 'n5', type: 'conversation', x: 280, y: 360, title: 'Nurture & Schedule Demo', color: '#6366f1' },
            { id: 'n6', type: 'end', x: 180, y: 460, title: 'End', color: '#ef4444' },
        ],
        edges: [
            { id: 'e1', from: 'n1', to: 'n2' },
            { id: 'e2', from: 'n2', to: 'n3' },
            { id: 'e3', from: 'n3', to: 'n4', label: 'qualified' },
            { id: 'e4', from: 'n3', to: 'n5', label: 'not qualified' },
            { id: 'e5', from: 'n4', to: 'n6' },
            { id: 'e6', from: 'n5', to: 'n6' },
        ],
    },
];

// ── Node type metadata ──────────────────────────────────────────────────────────
const NODE_TYPES = {
    start: { icon: Zap, label: 'Start', color: '#6366f1', bg: '#1e1b4b' },
    conversation: { icon: MessageSquare, label: 'Conversation', color: '#6366f1', bg: '#1e1b4b' },
    condition: { icon: GitBranch, label: 'Condition', color: '#f59e0b', bg: '#1c1708' },
    api: { icon: Globe, label: 'API Request', color: '#22c55e', bg: '#052e16' },
    transfer: { icon: Phone, label: 'Transfer', color: '#8b5cf6', bg: '#1e1040' },
    end: { icon: X, label: 'End', color: '#ef4444', bg: '#1c0a0a' },
};

// ── Canvas Node Component ──────────────────────────────────────────────────────
function CanvasNode({ node, selected, onClick, onDragStart }: {
    node: WorkflowNode;
    selected: boolean;
    onClick: () => void;
    onDragStart: (e: React.MouseEvent, id: string) => void;
}) {
    const meta = NODE_TYPES[node.type];
    const Icon = meta.icon;

    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            onClick={onClick}
            onMouseDown={e => { e.stopPropagation(); onDragStart(e, node.id); }}
            className="cursor-pointer"
            style={{ userSelect: 'none' }}
        >
            {/* Shadow */}
            <rect x={2} y={4} width={200} height={node.type === 'start' || node.type === 'end' ? 44 : 72}
                rx={8} fill="rgba(0,0,0,0.5)" />
            {/* Main bg */}
            <rect x={0} y={0} width={200} height={node.type === 'start' || node.type === 'end' ? 44 : 72}
                rx={8} fill={meta.bg}
                stroke={selected ? '#ffffff' : meta.color}
                strokeWidth={selected ? 2 : 1}
            />
            {/* Left accent bar */}
            <rect x={0} y={0} width={4} height={node.type === 'start' || node.type === 'end' ? 44 : 72}
                rx={2} fill={meta.color} />
            {/* Icon */}
            <circle cx={24} cy={22} r={12} fill={`${meta.color}22`} />
            <Icon size={12} x={18} y={16} color={meta.color} />
            {/* Title */}
            <text x={42} y={16} fill="#f5f5f5" fontSize={11} fontWeight="600" fontFamily="Inter">{node.title}</text>
            <text x={42} y={28} fill={meta.color} fontSize={9} fontFamily="Inter" opacity={0.8}>{meta.label}</text>
            {/* Prompt preview */}
            {node.prompt && node.type !== 'start' && node.type !== 'end' && (
                <text x={8} y={50} fill="#71717a" fontSize={8.5} fontFamily="Inter" width={185}>
                    {node.prompt.slice(0, 40)}...
                </text>
            )}
        </g>
    );
}

// ── Edge Component ──────────────────────────────────────────────────────────────
function CanvasEdge({ edge, nodes }: { edge: WorkflowEdge; nodes: WorkflowNode[] }) {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) return null;

    const fromH = from.type === 'start' || from.type === 'end' ? 44 : 72;
    const x1 = from.x + 100;
    const y1 = from.y + fromH;
    const x2 = to.x + 100;
    const y2 = to.y;
    const midY = (y1 + y2) / 2;

    const path = `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;

    return (
        <g>
            <path d={path} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeOpacity={0.7} markerEnd="url(#arrow)" />
            {edge.label && (
                <>
                    <rect x={(x1 + x2) / 2 - 28} y={midY - 10} width={56} height={16} rx={4} fill="#1a1200" stroke="#f59e0b" strokeWidth={0.75} strokeOpacity={0.5} />
                    <text x={(x1 + x2) / 2} y={midY + 2} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="Inter" opacity={0.9}>{edge.label}</text>
                </>
            )}
        </g>
    );
}

// ── Workflow Canvas Editor ─────────────────────────────────────────────────────
export function WorkflowEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const wf = MOCK_WORKFLOWS.find(w => w.id === id) || MOCK_WORKFLOWS[0];

    const [nodes, setNodes] = useState<WorkflowNode[]>(wf.nodes);
    const [edges] = useState<WorkflowEdge[]>(wf.edges);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 40, y: 40 });
    const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const node = nodes.find(n => n.id === selectedNode);

    const handleDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
        const n = nodes.find(x => x.id === nodeId)!;
        setDragging({ id: nodeId, ox: e.clientX - n.x * zoom - pan.x, oy: e.clientY - n.y * zoom - pan.y });
        setSelectedNode(nodeId);
    }, [nodes, zoom, pan]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!dragging) return;
            const nx = (e.clientX - dragging.ox - pan.x) / zoom;
            const ny = (e.clientY - dragging.oy - pan.y) / zoom;
            setNodes(prev => prev.map(n => n.id === dragging.id ? { ...n, x: Math.max(0, nx), y: Math.max(0, ny) } : n));
        };
        const onUp = () => setDragging(null);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [dragging, zoom, pan]);

    const addNode = (type: WorkflowNode['type']) => {
        const meta = NODE_TYPES[type];
        setNodes(prev => [...prev, {
            id: `n${Date.now()}`,
            type,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 150,
            title: meta.label,
            color: meta.color,
        }]);
    };

    return (
        <div className="flex h-[calc(100vh-57px)] -m-6 overflow-hidden">
            {/* Left Panel */}
            <div className="w-52 border-r border-border bg-card flex flex-col z-10">
                <div className="p-3 border-b border-border">
                    <button onClick={() => navigate('/workflows')} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-3 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Workflows
                    </button>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary truncate">{wf.name}</span>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono mt-0.5">{wf.id}</p>
                </div>

                <div className="p-3 border-b border-border">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Add a Node</p>
                    <div className="space-y-1.5">
                        {Object.entries(NODE_TYPES).filter(([k]) => k !== 'start').map(([type, meta]) => {
                            const Icon = meta.icon;
                            return (
                                <button key={type} onClick={() => addNode(type as WorkflowNode['type'])}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-left">
                                    <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                                    {meta.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-3 border-b border-border space-y-1.5">
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-text-muted hover:bg-white/5">
                        <MessageSquare className="w-3.5 h-3.5 text-accent" /> Global Prompt
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-text-muted hover:bg-white/5">
                        <Phone className="w-3.5 h-3.5 text-accent" /> Global Voice
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-text-muted hover:bg-white/5">
                        <Code2 className="w-3.5 h-3.5 text-accent" /> Variables
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden"
                style={{ backgroundImage: 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)', backgroundSize: '32px 32px' }}>

                {/* Top toolbar */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1.5 shadow-xl">
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-text-muted font-mono px-1">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }); }} className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
                        <Move className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Top right actions */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                        <Code2 className="w-3.5 h-3.5" /> View JSON
                    </button>
                    <button className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                        <Phone className="w-3.5 h-3.5" /> Call
                        <ChevronDown className="w-3 h-3 opacity-70" />
                    </button>
                    <button className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> Save
                    </button>
                </div>

                {/* SVG Canvas */}
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    onClick={() => setSelectedNode(null)}
                    style={{ cursor: dragging ? 'grabbing' : 'default' }}
                >
                    <defs>
                        <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" opacity={0.8} />
                        </marker>
                    </defs>
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                        {/* Edges */}
                        {edges.map(edge => <CanvasEdge key={edge.id} edge={edge} nodes={nodes} />)}
                        {/* Nodes */}
                        {nodes.map(node => (
                            <CanvasNode
                                key={node.id}
                                node={node}
                                selected={selectedNode === node.id}
                                onClick={() => setSelectedNode(node.id)}
                                onDragStart={handleDragStart}
                            />
                        ))}
                    </g>
                </svg>

                {/* Mini map */}
                <div className="absolute bottom-4 right-4 w-40 h-28 bg-card/80 border border-border rounded-lg overflow-hidden backdrop-blur-sm">
                    <p className="text-[9px] text-text-muted px-2 py-1 border-b border-border">Composer</p>
                    <svg width="100%" height="100%" viewBox="0 0 700 800" opacity={0.7}>
                        {nodes.map(n => (
                            <rect key={n.id} x={n.x * 0.25} y={n.y * 0.18} width={50} height={12}
                                rx={2} fill={NODE_TYPES[n.type].color} opacity={0.6} />
                        ))}
                    </svg>
                </div>
            </div>

            {/* Right panel - node editor */}
            {node && (
                <div className="w-64 border-l border-border bg-card overflow-y-auto z-10">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary">{node.title}</span>
                        <button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="form-group">
                            <label className="form-label">Node Title</label>
                            <input className="input text-sm" value={node.title}
                                onChange={e => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: e.target.value } : n))} />
                        </div>
                        {node.type === 'conversation' && (
                            <div className="form-group">
                                <label className="form-label">Prompt</label>
                                <textarea className="input text-xs font-mono min-h-[120px] resize-vertical"
                                    value={node.prompt || ''}
                                    onChange={e => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, prompt: e.target.value } : n))} />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Node Type</label>
                            <div className="px-2 py-1.5 rounded border border-border bg-background text-xs capitalize text-text-secondary">{node.type}</div>
                        </div>
                        <button onClick={() => { setNodes(prev => prev.filter(n => n.id !== node.id)); setSelectedNode(null); }}
                            className="w-full btn-danger text-xs flex items-center justify-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" /> Delete Node
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Workflow List Page ─────────────────────────────────────────────────────────
const SORT_OPTIONS = ['Recently Created', 'Recently Updated', 'Name (A-Z)'];

export function WorkflowsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('Recently Created');
    const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);

    const filtered = workflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
        if (sort === 'Name (A-Z)') return a.name.localeCompare(b.name);
        if (sort === 'Recently Updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const createWorkflow = () => {
        const newWf: Workflow = {
            id: `wf_${Date.now()}`,
            name: 'Untitled Workflow',
            stepCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            nodes: [{ id: 'n1', type: 'start', x: 200, y: 20, title: 'Start', color: '#6366f1' }],
            edges: [],
        };
        setWorkflows(prev => [newWf, ...prev]);
        navigate(`/workflows/${newWf.id}`);
    };

    const deleteWorkflow = (id: string) => {
        setWorkflows(prev => prev.filter(w => w.id !== id));
        setMenuOpen(null);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-text-primary">Workflows</h1>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-accent/20 text-accent border border-accent/30">Beta</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary flex items-center gap-1.5 text-sm">
                        <Upload className="w-4 h-4" /> Upload JSON
                    </button>
                    <button className="btn-secondary flex items-center gap-1.5 text-sm">
                        <BookOpen className="w-4 h-4" /> Docs
                    </button>
                    <button onClick={createWorkflow} className="btn-primary flex items-center gap-1.5">
                        <Plus className="w-4 h-4" /> Create Workflow
                    </button>
                </div>
            </div>

            {/* Search & sort */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input className="input pl-9 w-full" placeholder="Search workflows..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="ml-auto">
                    <select className="input text-sm" value={sort} onChange={e => setSort(e.target.value)}>
                        {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Step Count</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-text-muted">No workflows found</td></tr>
                        ) : sorted.map(wf => (
                            <tr key={wf.id} onClick={() => navigate(`/workflows/${wf.id}`)} className="cursor-pointer group">
                                <td className="font-semibold text-text-primary">{wf.name}</td>
                                <td className="text-text-secondary">{wf.stepCount}</td>
                                <td className="text-text-muted text-sm">{format(new Date(wf.createdAt), 'MMM d, yyyy')}</td>
                                <td className="text-text-muted text-sm">{format(new Date(wf.updatedAt), 'MMM d, yyyy')}</td>
                                <td onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => navigate(`/workflows/${wf.id}`)} className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-accent transition-colors" title="View JSON">
                                            <Code2 className="w-4 h-4" />
                                        </button>
                                        <div className="relative">
                                            <button onClick={() => setMenuOpen(menuOpen === wf.id ? null : wf.id)} className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            {menuOpen === wf.id && (
                                                <div className="absolute right-0 top-7 z-20 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[130px]" onMouseLeave={() => setMenuOpen(null)}>
                                                    <button onClick={() => navigate(`/workflows/${wf.id}`)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5">
                                                        <Code2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5">
                                                        <Copy className="w-3.5 h-3.5" /> Duplicate
                                                    </button>
                                                    <button onClick={() => deleteWorkflow(wf.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
