"use client"

import { useState } from "react"
import { getAdmins, createAdmin, deleteAdmin } from "./actions"
import { Plus, Trash2, X, Shield, Calendar, User } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

export default function AdminsClient({ initialData }: { initialData: any[] }) {
    const [admins, setAdmins] = useState<any[]>(initialData)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ username: "", password: "" })
    const [itemToDelete, setItemToDelete] = useState<{id: string, username: string} | null>(null)
    const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null)

    const showToast = (message: string, type: 'success'|'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadAdmins = async () => {
        const res = await getAdmins()
        if (res.success && res.data) setAdmins(res.data)
    }

    const handleSave = async () => {
        if (!newAdmin.username || !newAdmin.password) return
        const fakeId = Date.now().toString()
        const payload = { ...newAdmin }
        setIsModalOpen(false)
        setNewAdmin({ username: "", password: "" })
        setAdmins(prev => [{ id: fakeId, username: payload.username, createdAt: new Date() }, ...prev])
        const res = await createAdmin(payload)
        if (res.success) { showToast("Admin created successfully"); loadAdmins() }
        else { showToast(res.error || "Failed to create admin", 'error'); loadAdmins() }
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete.id
        setAdmins(prev => prev.filter(a => a.id !== id))
        setItemToDelete(null)
        const res = await deleteAdmin(id)
        if (!res.success) { showToast("Failed to delete admin", 'error'); loadAdmins() }
        else showToast("Admin deleted")
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage administrator accounts for this portal.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
                >
                    <Plus className="h-4 w-4" /> Add Admin
                </button>
            </div>

            {/* Cards grid */}
            {admins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Shield className="h-10 w-10 mb-3 opacity-30" />
                    <p className="font-medium">No administrators found</p>
                    <p className="text-sm mt-1">Add the first admin using the button above</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {admins.map((admin, i) => (
                        <div
                            key={admin.id}
                            className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            {/* Delete button */}
                            <button
                                onClick={() => setItemToDelete({ id: admin.id, username: admin.username })}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                                title="Delete admin"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                                    {admin.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white truncate">{admin.username}</p>
                                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold border border-purple-100 dark:border-purple-900/50">
                                        <Shield className="h-3 w-3" /> Super Admin
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Joined {new Date(admin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold">Add New Admin</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Create a new administrator account</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        value={newAdmin.username}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="e.g. john.doe"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="Minimum 6 characters"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!newAdmin.username || !newAdmin.password}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-blue-500/20"
                        >
                            Create Admin Account
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-200">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                        toast.type === 'success'
                            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400'
                            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                    }`}>
                        {toast.message}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!itemToDelete}
                title="Delete Admin"
                description={`Remove admin "${itemToDelete?.username}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    )
}
