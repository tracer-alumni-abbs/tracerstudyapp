"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Users, FileText, Settings, LogOut, LayoutDashboard, Menu, Shield, Loader2, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

const NAV_ITEMS = [
    { href: "/admin/dashboard", icon: LayoutDashboard, labelKey: "dashboard" as const },
    { href: "/admin/students",  icon: Users,           labelKey: "students"  as const },
    { href: "/admin/responses", icon: FileText,         labelKey: "responses" as const },
    { href: "/admin/questions", icon: Settings,         labelKey: "questions" as const },
    { href: "/admin/admins",    icon: Shield,           label: "Admins" },
] as const

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage()
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [authorized, setAuthorized] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [pendingHref, setPendingHref] = useState<string | null>(null)

    useEffect(() => {
        const session = Cookies.get("admin_session")
        if (pathname === "/admin/login") { setAuthorized(true); return }
        if (!session) { router.push("/admin/login") } else { setAuthorized(true) }
    }, [pathname, router])

    useEffect(() => { setPendingHref(null) }, [pathname])

    const navLabel = (item: typeof NAV_ITEMS[number]) =>
        "label" in item ? item.label : t.admin.sidebar[item.labelKey]

    const navigate = (href: string) => {
        if (href === pathname) return
        setPendingHref(href)
        setIsSidebarOpen(false)
        startTransition(() => router.push(href))
    }

    if (!authorized) return null

    if (pathname === "/admin/login") {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>
    }

    // Page title from current path
    const currentNav = NAV_ITEMS.find(n => n.href === pathname)
    const pageTitle = currentNav ? navLabel(currentNav) : ""

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">

            {/* ─── Sidebar ─────────────────────────────── */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900",
                "border-r border-slate-200 dark:border-slate-800",
                "transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.admin.sidebar.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">Management Portal</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden flex items-center justify-center h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pt-2 pb-1.5">
                        Menu
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const href = item.href
                        const isActive = pathname === href
                        const isPendingThis = pendingHref === href
                        const isHighlighted = isActive || isPendingThis
                        const Icon = item.icon

                        return (
                            <button
                                key={href}
                                onClick={() => navigate(href)}
                                className={cn(
                                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                                    "active:scale-[0.97]",
                                    isHighlighted
                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                                )}
                            >
                                <span className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                                    isHighlighted
                                        ? "bg-white/20"
                                        : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                                )}>
                                    {isPendingThis && !isActive
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Icon className="h-3.5 w-3.5" />
                                    }
                                </span>
                                <span className="flex-1 text-left">{navLabel(item)}</span>
                                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                            </button>
                        )
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">Administrator</p>
                            <p className="text-[10px] text-slate-400 truncate">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { Cookies.remove("admin_session"); router.push("/admin/login") }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.97]"
                    >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <LogOut className="h-3.5 w-3.5" />
                        </span>
                        <span>{t.admin.sidebar.logout}</span>
                    </button>
                </div>
            </aside>

            {/* ─── Main Content ────────────────────────── */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                {/* Top header bar */}
                <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="hidden md:block text-slate-400 dark:text-slate-500">Admin</span>
                        <span className="hidden md:block text-slate-300 dark:text-slate-700">/</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{pageTitle}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {isPending && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span className="hidden sm:block">Loading...</span>
                            </div>
                        )}
                        <LanguageSwitcher />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}
