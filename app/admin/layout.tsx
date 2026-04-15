"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Users, FileText, Settings, LogOut, LayoutDashboard, Menu, Shield, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
// Import Language Provider hooks
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { t } = useLanguage()
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [authorized, setAuthorized] = useState(false)
    const [isPending, startTransition] = useTransition()
    // Track which nav item was just clicked for instant feedback
    const [pendingHref, setPendingHref] = useState<string | null>(null)

    // Check Auth
    useEffect(() => {
        const session = Cookies.get("admin_session")
        if (pathname === "/admin/login") {
            setAuthorized(true)
            return
        }

        if (!session) {
            router.push("/admin/login")
        } else {
            setAuthorized(true)
        }
    }, [pathname, router])

    // Clear pendingHref when navigation completes
    useEffect(() => {
        setPendingHref(null)
    }, [pathname])

    if (!authorized) return null // or a loading spinner

    // Independent Layout for Login Page
    if (pathname === "/admin/login") {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-lg font-bold">{t.admin.sidebar.title}</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    <NavItem href="/admin/dashboard" icon={LayoutDashboard} label={t.admin.sidebar.dashboard} active={pathname === "/admin/dashboard"} pending={pendingHref === "/admin/dashboard"} onClick={() => { setPendingHref("/admin/dashboard"); startTransition(() => router.push("/admin/dashboard")); setIsSidebarOpen(false) }} />
                    <NavItem href="/admin/students" icon={Users} label={t.admin.sidebar.students} active={pathname === "/admin/students"} pending={pendingHref === "/admin/students"} onClick={() => { setPendingHref("/admin/students"); startTransition(() => router.push("/admin/students")); setIsSidebarOpen(false) }} />
                    <NavItem href="/admin/responses" icon={FileText} label={t.admin.sidebar.responses} active={pathname === "/admin/responses"} pending={pendingHref === "/admin/responses"} onClick={() => { setPendingHref("/admin/responses"); startTransition(() => router.push("/admin/responses")); setIsSidebarOpen(false) }} />
                    <NavItem href="/admin/questions" icon={Settings} label={t.admin.sidebar.questions} active={pathname === "/admin/questions"} pending={pendingHref === "/admin/questions"} onClick={() => { setPendingHref("/admin/questions"); startTransition(() => router.push("/admin/questions")); setIsSidebarOpen(false) }} />
                    <NavItem href="/admin/admins" icon={Shield} label="Admins" active={pathname === "/admin/admins"} pending={pendingHref === "/admin/admins"} onClick={() => { setPendingHref("/admin/admins"); startTransition(() => router.push("/admin/admins")); setIsSidebarOpen(false) }} />
                </nav>
                <div className="absolute bottom-4 left-0 right-0 p-4">
                    <button
                        onClick={() => {
                            Cookies.remove("admin_session")
                            router.push("/admin/login")
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">{t.admin.sidebar.logout}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto w-full">
                <header className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="mr-4 text-slate-500">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold">{t.admin.sidebar.title}</span>
                    <div className="ml-auto flex items-center gap-3">
                        {isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                        <LanguageSwitcher />
                    </div>
                </header>
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}

function NavItem({ href, icon: Icon, label, active, pending, onClick }: { href: string, icon: any, label: string, active: boolean, pending?: boolean, onClick?: () => void }) {
    const isHighlighted = active || pending
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all active:scale-95",
                isHighlighted
                    ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
        >
            {pending && !active ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <Icon className="h-5 w-5" />
            )}
            <span className="font-medium">{label}</span>
        </button>
    )
}
