import React, { useState, useCallback } from 'react';
import { Upload, File, Trash2, AlertCircle } from 'lucide-react';
import { useFileStore, useToastStore } from '@/store';
import { Badge, EmptyState, ConfirmDialog } from '@/components/ui/index';
import { format } from 'date-fns';
import { clsx } from 'clsx';

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesPage() {
    const { files, uploadFile, deleteFile } = useFileStore();
    const { addToast } = useToastStore();
    const [dragging, setDragging] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        for (const file of Array.from(e.dataTransfer.files)) {
            await uploadFile(file);
            addToast(`Uploaded ${file.name}`, 'success');
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        for (const file of Array.from(e.target.files || [])) {
            await uploadFile(file);
            addToast(`Uploaded ${file.name}`, 'success');
        }
    };

    const usedBytes = files.reduce((a, f) => a + f.size, 0);
    const planBytes = 500 * 1024 * 1024; // 500 MB

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-text-primary">Files</h1>
                <p className="text-sm text-text-muted">Knowledge base documents for your assistants</p>
            </div>

            {/* Usage Bar */}
            <div className="card p-4">
                <div className="flex justify-between text-xs text-text-muted mb-2">
                    <span>Storage Used</span><span>{formatBytes(usedBytes)} / {formatBytes(planBytes)}</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${(usedBytes / planBytes) * 100}%` }} />
                </div>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={clsx('border-2 border-dashed rounded-card p-10 text-center transition-colors', dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50')}
            >
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-text-muted mb-3">PDF, TXT, DOCX, CSV up to 50MB each</p>
                <label className="btn-primary cursor-pointer">
                    Browse Files
                    <input type="file" multiple accept=".pdf,.txt,.docx,.csv" className="hidden" onChange={handleFileSelect} />
                </label>
            </div>

            {/* Files Table */}
            {files.length > 0 && (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>File Name</th><th>Size</th><th>Type</th><th>Uploaded</th><th>Status</th><th>Used By</th><th></th></tr></thead>
                        <tbody>
                            {files.map(file => (
                                <tr key={file.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <File className="w-4 h-4 text-accent flex-shrink-0" />
                                            <span className="text-text-primary text-sm font-medium">{file.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-xs">{formatBytes(file.size)}</td>
                                    <td className="text-xs text-text-muted">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</td>
                                    <td className="text-xs text-text-muted">{format(new Date(file.uploadedAt), 'MMM d, yyyy')}</td>
                                    <td>
                                        {file.status === 'processing'
                                            ? <span className="badge-warning flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Processing</span>
                                            : file.status === 'ready' ? <span className="badge-success">Ready</span>
                                                : <span className="badge-error">Error</span>}
                                    </td>
                                    <td className="text-xs text-text-muted">{file.usageCount} assistant{file.usageCount !== 1 ? 's' : ''}</td>
                                    <td>
                                        <button onClick={() => setDeleteTarget(file.id)} className="text-text-muted hover:text-error transition-colors p-1">
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
                onConfirm={async () => { if (deleteTarget) { await deleteFile(deleteTarget); addToast('File deleted', 'success'); setDeleteTarget(null); } }}
                title="Delete File" message="Remove this file from your knowledge base?" confirmLabel="Delete" danger />
        </div>
    );
}
