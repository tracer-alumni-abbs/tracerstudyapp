"use client"

import { useLanguage } from "@/components/providers/LanguageProvider"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-slate-500" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "id")}
                className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
            >
                <option value="id">Indonesian</option>
                <option value="en">English</option>
            </select>
        </div>
    )
}
