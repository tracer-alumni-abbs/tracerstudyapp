"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2,
    Search, Plus, Trash2, Briefcase, GraduationCap, Clock, HelpCircle
} from "lucide-react"

import { verifyIdentity, submitSurvey } from "./actions"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// ─── Status options ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
    {
        id: "working",
        icon: Briefcase,
        labelEn: "Working / Employed",
        labelId: "Bekerja / Karyawan",
        subEn: "Currently employed at a company or organization",
        subId: "Saat ini bekerja di perusahaan atau organisasi",
        color: "blue",
    },
    {
        id: "entrepreneur",
        icon: () => <span className="text-lg">💼</span>,
        labelEn: "Entrepreneur / Freelance",
        labelId: "Wirausaha / Freelance",
        subEn: "Running your own business or working independently",
        subId: "Menjalankan usaha sendiri atau bekerja secara mandiri",
        color: "violet",
    },
    {
        id: "studying",
        icon: GraduationCap,
        labelEn: "Continuing Study",
        labelId: "Lanjut Studi",
        subEn: "Currently enrolled in university or higher education",
        subId: "Sedang kuliah atau mengikuti pendidikan lanjutan",
        color: "emerald",
    },
    {
        id: "not_working",
        icon: Clock,
        labelEn: "Not Working Yet",
        labelId: "Belum Bekerja",
        subEn: "Currently looking for opportunities or taking a break",
        subId: "Sedang mencari kesempatan atau belum mulai bekerja",
        color: "amber",
    },
]

const COLOR_MAP: Record<string, string> = {
    blue:    "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    violet:  "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300",
    emerald: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
    amber:   "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
}

const ICON_COLOR_MAP: Record<string, string> = {
    blue:    "text-blue-600 dark:text-blue-400",
    violet:  "text-violet-600 dark:text-violet-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber:   "text-amber-600 dark:text-amber-400",
}

export default function FormClient({ studentId, initialProfile }: { studentId: string, initialProfile: any }) {
    const { t, language } = useLanguage()
    const lang = language   // alias for brevity throughout this file
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [animKey, setAnimKey] = useState(0)
    const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward')

    const [profile, setProfile] = useState<any>(initialProfile)

    // Step 2 state
    const [currentStatus, setCurrentStatus] = useState<string>("")  // working/entrepreneur/studying/not_working
    const [jobs, setJobs] = useState<any[]>([])                     // for working/entrepreneur
    const [university, setUniversity] = useState("")                 // for studying
    const [major, setMajor] = useState("")                           // for studying

    // Step 3 state (additional questions)
    const [relevanceRating, setRelevanceRating] = useState<number>(0)
    const [suggestions, setSuggestions] = useState("")

    // Verification state
    const [birthDate, setBirthDate] = useState("")
    const [verificationError, setVerificationError] = useState("")
    const [verifying, setVerifying] = useState(false)

    // Toast
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const goToStep = (nextStep: number, dir: 'forward' | 'back' = 'forward') => {
        setSlideDir(dir)
        setAnimKey(k => k + 1)
        setStep(nextStep)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Job history helpers
    const addJob = () => setJobs(prev => [...prev, { id: Date.now(), company: "", position: "", startDate: "", isCurrent: false }])
    const removeJob = (id: number) => setJobs(prev => prev.filter(j => j.id !== id))
    const updateJob = (id: number, field: string, value: any) =>
        setJobs(prev => prev.map(j => j.id === id ? { ...j, [field]: value } : j))

    const handleSubmit = async () => {
        setLoading(true)

        // Auto-derive status string for existing q1 field
        const statusLabel = STATUS_OPTIONS.find(s => s.id === currentStatus)
        const statusText = lang === 'id' ? statusLabel?.labelId : statusLabel?.labelEn

        // Build responses object matching existing DB schema
        const responses: Record<string, any> = {
            q1: statusText || currentStatus,
            q2: relevanceRating || null,
            q3: suggestions || null,
            // extra enrichment
            university: university || null,
            major: major || null,
        }

        // Use jobs only for working/entrepreneur statuses
        const jobsToSubmit = (currentStatus === "working" || currentStatus === "entrepreneur") ? jobs : []

        const result = await submitSurvey(studentId, profile, jobsToSubmit, responses)
        setLoading(false)

        if (result.success) {
            router.push(`/thank-you?name=${encodeURIComponent(profile.name || "")}`)
        } else {
            showToast(result.message || "An error occurred during submission", 'error')
        }
    }

    const isWorking = currentStatus === "working" || currentStatus === "entrepreneur"
    const isStudying = currentStatus === "studying"

    const STEP_LABELS = lang === 'id'
        ? ["Verifikasi", "Status Saat Ini", "Pertanyaan Tambahan"]
        : ["Verify", "Current Status", "Additional Questions"]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900 py-10 px-4 relative">
            <style>{`
                @keyframes slide-in-forward {
                    from { opacity: 0; transform: translateX(36px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-back {
                    from { opacity: 0; transform: translateX(-36px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .step-forward { animation: slide-in-forward 0.28s cubic-bezier(0.22,1,0.36,1) both; }
                .step-back    { animation: slide-in-back    0.28s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>

            <div className="absolute top-6 right-6 z-50">
                <LanguageSwitcher />
            </div>

            <div className="max-w-2xl mx-auto">
                {/* ─── Progress ──────────────────────────────── */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {STEP_LABELS.map((label, idx) => {
                            const s = idx + 1
                            const isDone = step > s
                            const isCurrent = step === s
                            return (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2 transition-all duration-300 ${
                                        isDone   ? "bg-blue-600 border-blue-600 text-white" :
                                        isCurrent ? "bg-white dark:bg-slate-900 border-blue-600 text-blue-600" :
                                                   "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                                    }`}>
                                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                                        {label}
                                    </span>
                                    {idx < 2 && <div className="w-8 sm:w-16 h-px bg-slate-200 dark:bg-slate-700 mx-1" />}
                                </div>
                            )
                        })}
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>
                </div>

                {/* ─── Card ────────────────────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200/60 dark:border-slate-800 overflow-hidden">

                    {/* ── Step 1: Verifikasi ─────────────────────── */}
                    {step === 1 && (
                        <div key={animKey} className={`p-8 space-y-6 ${slideDir === 'forward' ? 'step-forward' : 'step-back'}`}>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{t.form.step1.title}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {lang === 'id' ? "Pastikan data berikut sudah benar" : "Please confirm your information below"}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t.form.step1.name}</label>
                                    <input disabled value={profile.name}
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-500 dark:text-slate-400 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t.form.step1.batch}</label>
                                    <input disabled value={profile.batch}
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-500 dark:text-slate-400 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t.form.step1.phone}</label>
                                    <input
                                        value={profile.phone || ""}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t.form.step1.email}</label>
                                    <input
                                        value={profile.email || ""}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="email@example.com"
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {t.form.step1.birthDate} <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{t.form.step1.verificationNote}</p>
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => { setBirthDate(e.target.value); setVerificationError("") }}
                                        className={`block w-full md:w-1/2 rounded-xl border ${verificationError ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                                    />
                                    {verificationError && <p className="text-red-500 text-xs font-medium">{verificationError}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Status Saat Ini ────────────────── */}
                    {step === 2 && (
                        <div key={animKey} className={`p-8 space-y-6 ${slideDir === 'forward' ? 'step-forward' : 'step-back'}`}>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {lang === 'id' ? "Status Saat Ini" : "Current Status"}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {lang === 'id'
                                        ? "Pilih yang paling sesuai dengan kondisi kamu sekarang"
                                        : "Select what best describes your current situation"}
                                </p>
                            </div>

                            {/* Status picker */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                {STATUS_OPTIONS.map((opt) => {
                                    const isSelected = currentStatus === opt.id
                                    const Icon = opt.icon as any
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setCurrentStatus(opt.id)
                                                // Clear irrelevant state when switching
                                                if (opt.id !== "studying") { setUniversity(""); setMajor("") }
                                                if (opt.id !== "working" && opt.id !== "entrepreneur") setJobs([])
                                            }}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                                                isSelected
                                                    ? COLOR_MAP[opt.color]
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            }`}
                                        >
                                            <span className={`mt-0.5 shrink-0 ${isSelected ? ICON_COLOR_MAP[opt.color] : "text-slate-400"}`}>
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className={`font-semibold text-sm ${isSelected ? "" : "text-slate-700 dark:text-slate-200"}`}>
                                                    {lang === 'id' ? opt.labelId : opt.labelEn}
                                                </p>
                                                <p className={`text-xs mt-0.5 ${isSelected ? "opacity-80" : "text-slate-400 dark:text-slate-500"}`}>
                                                    {lang === 'id' ? opt.subId : opt.subEn}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Conditional: Studying → University info */}
                            {isStudying && (
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-emerald-500" />
                                        {lang === 'id' ? "Info Perguruan Tinggi" : "University Information"}
                                        <span className="text-xs text-slate-400 font-normal">({lang === 'id' ? 'opsional' : 'optional'})</span>
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {lang === 'id' ? "Perguruan Tinggi" : "University / College"}
                                            </label>
                                            <input
                                                value={university}
                                                onChange={(e) => setUniversity(e.target.value)}
                                                placeholder={lang === 'id' ? "Nama universitas/kampus" : "University name"}
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {lang === 'id' ? "Program Studi" : "Major / Program"}
                                            </label>
                                            <input
                                                value={major}
                                                onChange={(e) => setMajor(e.target.value)}
                                                placeholder={lang === 'id' ? "Jurusan / prodi" : "Your major"}
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conditional: Working/Entrepreneur → Job history */}
                            {isWorking && (
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-blue-500" />
                                            {lang === 'id' ? "Riwayat Pekerjaan" : "Job History"}
                                            <span className="text-xs text-slate-400 font-normal">({lang === 'id' ? 'opsional' : 'optional'})</span>
                                        </h3>
                                        <button
                                            onClick={addJob}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold active:scale-95 transition-transform"
                                        >
                                            <Plus className="h-4 w-4" />
                                            {lang === 'id' ? "Tambah" : "Add"}
                                        </button>
                                    </div>

                                    {jobs.length === 0 ? (
                                        <button
                                            onClick={addJob}
                                            className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm hover:border-blue-300 hover:text-blue-500 transition-colors"
                                        >
                                            + {lang === 'id' ? "Tambahkan pekerjaan pertama kamu" : "Add your first job entry"}
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            {jobs.map((job) => (
                                                <div key={job.id} className="relative p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                    <button
                                                        onClick={() => removeJob(job.id)}
                                                        className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <div className="grid gap-3 sm:grid-cols-2 pr-8">
                                                        <input
                                                            placeholder={lang === 'id' ? "Nama Perusahaan" : "Company Name"}
                                                            value={job.company}
                                                            onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                        />
                                                        <input
                                                            placeholder={lang === 'id' ? "Posisi / Jabatan" : "Position / Title"}
                                                            value={job.position}
                                                            onChange={(e) => updateJob(job.id, 'position', e.target.value)}
                                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={job.startDate}
                                                            onChange={(e) => updateJob(job.id, 'startDate', e.target.value)}
                                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                        />
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={job.isCurrent}
                                                                onChange={(e) => updateJob(job.id, 'isCurrent', e.target.checked)}
                                                                className="h-4 w-4 rounded text-blue-600 border-slate-300"
                                                            />
                                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                {lang === 'id' ? "Masih bekerja di sini" : "Currently working here"}
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 3: Additional Questions ───────────── */}
                    {step === 3 && (
                        <div key={animKey} className={`p-8 space-y-8 ${slideDir === 'forward' ? 'step-forward' : 'step-back'}`}>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {lang === 'id' ? "Pertanyaan Tambahan" : "Additional Questions"}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {lang === 'id'
                                        ? "Beberapa pertanyaan singkat untuk membantu sekolah berkembang"
                                        : "A few quick questions to help the school improve"}
                                </p>
                            </div>

                            {/* Q2: Relevance rating */}
                            <div className="space-y-3">
                                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                                    {t.form.step3.questions.q2}
                                </label>
                                <p className="text-xs text-slate-400">
                                    {lang === 'id' ? "1 = Tidak relevan, 5 = Sangat relevan" : "1 = Not relevant at all, 5 = Highly relevant"}
                                </p>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setRelevanceRating(num)}
                                            className={`relative h-12 w-12 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                                                relevanceRating === num
                                                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110'
                                                    : relevanceRating > 0 && num <= relevanceRating
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                {relevanceRating > 0 && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-in fade-in duration-200">
                                        {relevanceRating === 1 && (lang === 'id' ? "😕 Tidak relevan" : "😕 Not relevant")}
                                        {relevanceRating === 2 && (lang === 'id' ? "😐 Kurang relevan" : "😐 Slightly relevant")}
                                        {relevanceRating === 3 && (lang === 'id' ? "🙂 Cukup relevan" : "🙂 Moderately relevant")}
                                        {relevanceRating === 4 && (lang === 'id' ? "😊 Relevan" : "😊 Relevant")}
                                        {relevanceRating === 5 && (lang === 'id' ? "🎉 Sangat relevan!" : "🎉 Highly relevant!")}
                                    </p>
                                )}
                            </div>

                            {/* Q3: Suggestions */}
                            <div className="space-y-3">
                                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                                    {t.form.step3.questions.q3}
                                </label>
                                <textarea
                                    value={suggestions}
                                    onChange={(e) => setSuggestions(e.target.value)}
                                    placeholder={lang === 'id'
                                        ? "Tulis saran, masukan, atau harapanmu untuk ABBS..."
                                        : "Share your suggestions, feedback, or wishes for ABBS..."}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 min-h-[120px] text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                />
                                <p className="text-xs text-slate-400">
                                    {lang === 'id' ? "Opsional — tapi sangat berharga bagi kami 🙏" : "Optional — but it means a lot to us 🙏"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ─── Navigation ────────────────────────────── */}
                    <div className="flex justify-between items-center px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        {/* Back button */}
                        {step > 1 ? (
                            <button
                                onClick={() => goToStep(step - 1, 'back')}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t.form.step1.backBtn}
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/search')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <Search className="h-4 w-4" />
                                {t.form.step1.backToSearch}
                            </button>
                        )}

                        {/* Next / Submit button */}
                        {step < 3 ? (
                            <button
                                onClick={async () => {
                                    if (step === 1) {
                                        if (!birthDate) { setVerificationError(t.validation.required); return }
                                        setVerifying(true)
                                        const result = await verifyIdentity(studentId, birthDate)
                                        setVerifying(false)
                                        if (result.success) goToStep(2, 'forward')
                                        else setVerificationError(result.message || t.validation.error)
                                    } else if (step === 2) {
                                        if (!currentStatus) {
                                            showToast(lang === 'id' ? "Pilih status kamu terlebih dahulu" : "Please select your current status", 'error')
                                            return
                                        }
                                        goToStep(3, 'forward')
                                    }
                                }}
                                disabled={verifying}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-sm shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {verifying ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />{t.form.step1.verifying}</>
                                ) : (
                                    <>{t.form.step1.verifyBtn}<ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-sm shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" />{t.form.step3.submitting}</>
                                    : <><CheckCircle2 className="h-4 w-4" />{t.form.step3.submitBtn}</>
                                }
                            </button>
                        )}
                    </div>
                </div>

                {/* Step hint */}
                <p className="text-center text-xs text-slate-400 mt-4">
                    {lang === 'id' ? `Langkah ${step} dari 3` : `Step ${step} of 3`}
                </p>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-200">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
                        toast.type === 'success'
                            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400'
                            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    )
}
