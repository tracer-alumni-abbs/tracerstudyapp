"use client"

import { useState, useEffect } from "react"
import { getAdmins, createAdmin, deleteAdmin } from "./actions"
import { Plus, Trash2, X, Shield, Lock } from "lucide-react"

export default function AdminsPage() {
    const [admins, setAdmins] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ username: "", password: "" })

    useEffect(() => {
        loadAdmins()
    }, [])

    const loadAdmins = async () => {
        setLoading(true)
        const res = await getAdmins()
        if (res.success && res.data) {
            setAdmins(res.data)
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!newAdmin.username) return
        await createAdmin(newAdmin)
        loadAdmins()
        setIsModalOpen(false)
        setNewAdmin({ username: "", password: "" })
    }

    const handleDelete = async (id: string, username: string) => {
        if (confirm(`Are you sure you want to delete admin ${username}?`)) {
            await deleteAdmin(id)
            loadAdmins()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Users</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Admin
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3">Username</th>
                                <th className="px-6 py-3">Roles</th>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Loading admins...
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No registered administrators found.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-blue-500" />
                                            {admin.username}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs font-semibold">Super Admin</span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(admin.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(admin.id, admin.username)}
                                                className="text-slate-400 hover:text-red-600 outline-none"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Admin</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <input
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                    placeholder="Enter unique username"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                    placeholder="Enter secure password"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!newAdmin.username || !newAdmin.password}
                            className="w-full flex justify-center py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            Save Admin
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
