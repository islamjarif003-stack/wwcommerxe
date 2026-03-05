"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api } from "@/lib/apiClient";
import { BookOpen, Search } from "lucide-react";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    const load = (p = 1) => {
        setIsLoading(true);
        api.admin.auditLogs.list({ page: String(p), limit: "30" })
            .then((res) => {
                setLogs(res.data.items || []);
                setPagination({ total: res.data.total, totalPages: res.data.totalPages });
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(page); }, [page]);

    return (
        <AdminShell>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <BookOpen size={22} className="text-[var(--primary)]" /> Audit Logs
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">{pagination.total} total events recorded</p>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-base">
                        <thead className="text-[var(--text-primary)] border-b border-[var(--border)]">
                            <tr>
                                <th className="font-bold py-3 px-4 text-left">Action</th>
                                <th className="font-bold py-3 px-4 text-left">Entity</th>
                                <th className="font-bold py-3 px-4 text-left">User</th>
                                <th className="font-bold py-3 px-4 text-left">Role</th>
                                <th className="font-bold py-3 px-4 text-left">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i}>{[...Array(5)].map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-[var(--text-secondary)] font-medium">No logs yet</td></tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td>
                                            <span className="badge badge-primary text-[10px]">{log.action}</span>
                                        </td>
                                        <td className="text-sm font-medium text-[var(--text-primary)] capitalize">{log.entity}</td>
                                        <td className="text-sm font-medium text-[var(--text-primary)]">{log.userEmail || log.userId}</td>
                                        <td>
                                            <span className="badge badge-ghost text-[10px]">{log.userRole}</span>
                                        </td>
                                        <td className="text-sm text-[var(--text-secondary)]">
                                            {new Date(log.createdAt).toLocaleString("en-BD")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-[var(--border)] flex justify-between items-center bg-[var(--bg-card)]">
                        <p className="text-sm font-medium text-[var(--text-primary)]">Page {page} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
                            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
