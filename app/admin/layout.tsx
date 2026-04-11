"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Users, FileText, Settings, LogOut, LayoutDashboard, Menu, Shield } from "lucide-react"
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
                    <NavItem href="/admin/dashboard" icon={LayoutDashboard} label={t.admin.sidebar.dashboard} active={pathname === "/admin/dashboard"} />
                    <NavItem href="/admin/students" icon={Users} label={t.admin.sidebar.students} active={pathname === "/admin/students"} />
                    <NavItem href="/admin/responses" icon={FileText} label={t.admin.sidebar.responses} active={pathname === "/admin/responses"} />
                    <NavItem href="/admin/questions" icon={Settings} label={t.admin.sidebar.questions} active={pathname === "/admin/questions"} />
                    <NavItem href="/admin/admins" icon={Shield} label="Admins" active={pathname === "/admin/admins"} />
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
                    <div className="ml-auto">
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

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-all active:scale-95",
                active
                    ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </Link>
    )
}
