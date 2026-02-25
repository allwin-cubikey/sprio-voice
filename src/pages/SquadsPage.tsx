import React, { useState } from 'react';
import { Users, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useSquadStore, useAssistantStore, useToastStore } from '@/store';
import { Badge, EmptyState, ConfirmDialog } from '@/components/ui/index';
import { clsx } from 'clsx';

// Simple SVG Flow Diagram
function SquadFlowDiagram({ squad }: { squad: any }) {
    if (!squad.members.length) return <div className="text-xs text-text-muted text-center py-4">No members yet</div>;

    return (
        <svg width="100%" height={60 + squad.members.length * 60} className="overflow-visible">
            {squad.members.map((member: any, i: number) => {
                const x = 50; const y = 30 + i * 70;
                const hasNext = i < squad.members.length - 1;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={220} height={44} rx={8} fill="#1a1a1a" stroke="#6366f1" strokeWidth={1.5} />
                        <text x={x + 12} y={y + 20} fill="#f5f5f5" fontSize={11} fontFamily="Inter">{member.assistantName}</text>
                        {member.transferCondition && (
                            <text x={x + 12} y={y + 34} fill="#71717a" fontSize={9} fontFamily="Inter">{member.transferCondition?.slice(0, 32)}</text>
                        )}
                        {hasNext && (
                            <>
                                <line x1={x + 110} y1={y + 44} x2={x + 110} y2={y + 70} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,2" />
                                <polygon points={`${x + 106},${y + 65} ${x + 114},${y + 65} ${x + 110},${y + 70}`} fill="#6366f1" />
                            </>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

export function SquadsPage() {
    const { squads, deleteSquad } = useSquadStore();
    const { assistants } = useAssistantStore();
    const { addToast } = useToastStore();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Squads</h1>
                    <p className="text-sm text-text-muted">Chain multiple assistants for complex workflows</p>
                </div>
                <button className="btn-primary flex items-center gap-1.5"><Plus className="w-4 h-4" /> Create Squad</button>
            </div>

            {squads.length === 0 ? (
                <EmptyState icon={<Users className="w-8 h-8" />} title="No squads yet" description="Create a squad to chain assistants together for complex call flows." action={<button className="btn-primary">Create Squad</button>} />
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {squads.map(squad => (
                        <div key={squad.id} className="card p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">{squad.name}</h3>
                                    <p className="text-xs text-text-muted mt-0.5">{squad.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="gray">{squad.members.length} members</Badge>
                                    <button onClick={() => setDeleteTarget(squad.id)} className="text-text-muted hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                <div><span className="text-text-muted">Calls handled: </span><span className="font-medium">{squad.callCount.toLocaleString()}</span></div>
                                <div><span className="text-text-muted">Default: </span><span className="font-medium">{assistants.find(a => a.id === squad.defaultAssistantId)?.name || 'N/A'}</span></div>
                            </div>
                            <button onClick={() => setExpanded(expanded === squad.id ? null : squad.id)} className="text-xs text-accent hover:underline">
                                {expanded === squad.id ? 'Hide' : 'View'} Flow Diagram
                            </button>
                            {expanded === squad.id && (
                                <div className="mt-3 border-t border-border pt-3 overflow-x-auto">
                                    <SquadFlowDiagram squad={squad} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={async () => { if (deleteTarget) { await deleteSquad(deleteTarget); addToast('Squad deleted', 'success'); setDeleteTarget(null); } }}
                title="Delete Squad" message="Delete this squad? This cannot be undone." confirmLabel="Delete" danger />
        </div>
    );
}
