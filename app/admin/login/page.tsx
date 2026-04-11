"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Lock, Loader2 } from "lucide-react"
import { loginAdminAction } from "./actions"

export default function AdminLogin() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await loginAdminAction(username, password)
        if (res.success) {
            router.push("/admin/dashboard")
        } else {
            setError(res.error || "Login failed")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Login</h1>
                    <p className="text-sm text-slate-500">Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                            placeholder="admin"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                            placeholder="•••••"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded dark:bg-red-900/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    )
}
