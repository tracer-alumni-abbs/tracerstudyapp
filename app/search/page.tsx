"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, User, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStudentsByBatch } from "./actions"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"



export default function SearchPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [step, setStep] = useState<"batch" | "student">("batch")
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [students, setStudents] = useState<any[]>([])

    const batches = [2020, 2021, 2022, 2023, 2024]

    const handleSelectBatch = async (batch: number) => {
        setLoading(true)
        setSelectedBatch(batch)

        try {
            const result = await getStudentsByBatch(batch)
            if (result.success && result.data) {
                setStudents(result.data)
            } else {
                setStudents([])
            }
        } catch (error) {
            console.error(error)
            setStudents([])
        } finally {
            setLoading(false)
            setStep("student")
        }
    }

    const handleSelectStudent = (studentId: string) => {
        router.push(`/form/${studentId}`)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-6 right-6 z-50">
                <LanguageSwitcher />
            </div>
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-900/50 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
                            <User className="h-8 w-8" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2">{step === "batch" ? t.search.step1 : t.search.step2}</h1>
                    <p className="text-slate-500 text-center mb-8">{step === 'batch' ? t.search.selectBatch : t.search.selectName}</p>

                    {loading ? (
                        <div className="flex justify-center py-8 text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" /> {t.search.loading}
                        </div>
                    ) : step === "batch" ? (
                        <div className="grid grid-cols-2 gap-3">
                            {batches.map((batch) => (
                                <button
                                    key={batch}
                                    onClick={() => handleSelectBatch(batch)}
                                    className="flex flex-col items-center justify-center p-6 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-slate-800 transition-all"
                                >
                                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{batch}</span>
                                    <span className="text-xs text-slate-400">{t.search.batch}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => setStep("batch")}
                                className="text-sm text-slate-500 hover:text-blue-500 mb-4 flex items-center"
                            >
                                ← {t.search.backToBatches}
                            </button>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={t.search.searchPlaceholder}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                                {students.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        {t.search.noStudents} {selectedBatch}.
                                    </div>
                                ) : (
                                    students.map((student) => (
                                        <button
                                            key={student.id}
                                            onClick={() => handleSelectStudent(student.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{student.name}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                                        </button>
                                    )))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
