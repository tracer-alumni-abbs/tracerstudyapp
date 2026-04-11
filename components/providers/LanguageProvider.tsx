"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { dictionary, Language } from "@/lib/dictionary"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof dictionary['en']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("id") // Default to ID as requested implicitly by user language

    const value = {
        language,
        setLanguage,
        t: dictionary[language]
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
