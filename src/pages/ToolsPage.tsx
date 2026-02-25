import React, { useState } from 'react';
import { Plus, Trash2, Wrench, ExternalLink } from 'lucide-react';
import { useToolStore, useToastStore } from '@/store';
import { EmptyState, ConfirmDialog } from '@/components/ui/index';
import { format } from 'date-fns';

export function ToolsPage() {
    const { tools, deleteTool } = useToolStore();
    const { addToast } = useToastStore();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Tools</h1>
                    <p className="text-sm text-text-muted">Reusable server-side tools your assistants can call</p>
                </div>
                <button className="btn-primary flex items-center gap-1.5"><Plus className="w-4 h-4" /> Create Tool</button>
            </div>

            {tools.length === 0 ? (
                <EmptyState icon={<Wrench className="w-8 h-8" />} title="No tools yet" description="Create reusable tools that your assistants can call during conversations." action={<button className="btn-primary">Create Tool</button>} />
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Name</th><th>Description</th><th>Method</th><th>URL</th><th>Calls</th><th>Last Used</th><th></th></tr></thead>
                        <tbody>
                            {tools.map(tool => (
                                <tr key={tool.id} className="cursor-pointer">
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded bg-accent/10"><Wrench className="w-3.5 h-3.5 text-accent" /></div>
                                            <span className="font-mono text-sm text-text-primary">{tool.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-text-muted max-w-[200px] truncate">{tool.description}</td>
                                    <td>
                                        <span className={`badge font-mono text-[10px] ${tool.method === 'GET' ? 'badge-success' : tool.method === 'POST' ? 'badge-info' : 'badge-warning'}`}>
                                            {tool.method}
                                        </span>
                                    </td>
                                    <td className="font-mono text-xs text-text-muted max-w-[180px] truncate">{tool.url}</td>
                                    <td className="text-text-secondary">{tool.callCount.toLocaleString()}</td>
                                    <td className="text-text-muted text-xs">{format(new Date(tool.lastUsed), 'MMM d')}</td>
                                    <td>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(tool.id); }} className="text-text-muted hover:text-error transition-colors p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                onConfirm={async () => { if (deleteTarget) { await deleteTool(deleteTarget); addToast('Tool deleted', 'success'); setDeleteTarget(null); } }}
                title="Delete Tool" message="Delete this tool? Any assistants using it may break." confirmLabel="Delete" danger />
        </div>
    );
}
