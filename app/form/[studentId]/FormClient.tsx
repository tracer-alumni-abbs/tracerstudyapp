"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2,
    Search, Plus, Trash2, Briefcase, GraduationCap, Clock, HelpCircle
} from "lucide-react"

import { verifyIdentity, submitSurvey } from "./actions"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

type Program = { id: string; name: string; level: string | null }
type University = { id: string; name: string; programs: Program[] }
type Question = { 
    id: string; questionEn: string; questionId: string; type: string; 
    optionsEn: string[]; optionsId: string[]; order: number; 
    isStandard: boolean; standardKey: string | null;
    isRequired: boolean;
}

const BASE_STATUS_OPTIONS = [
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

function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
}: {
    options: string[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
}) {
    const [query, setQuery] = useState(value)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setQuery(value)
    }, [value])

    const filtered = query === "" ? options : options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="relative">
            <input
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                    onChange(e.target.value)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 text-sm shadow-lg">
                    {filtered.map(opt => (
                        <li
                            key={opt}
                            onClick={() => {
                                setQuery(opt)
                                onChange(opt)
                                setOpen(false)
                            }}
                            className="cursor-pointer px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300"
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default function FormClient({ 
    studentId, 
    initialProfile,
    questions = [],
    universities = []
}: { 
    studentId: string, 
    initialProfile: any,
    questions?: Question[],
    universities?: University[]
}) {
    const { t, language } = useLanguage()
    const lang = language
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [animKey, setAnimKey] = useState(0)
    const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward')

    const [profile, setProfile] = useState<any>(initialProfile)

    // Step 2 state
    const [currentStatus, setCurrentStatus] = useState<string>("")
    const [jobs, setJobs] = useState<any[]>([])
    const [university, setUniversity] = useState("")
    const [major, setMajor] = useState("")
    const [jalurMasuk, setJalurMasuk] = useState("")
    const [aktivitas, setAktivitas] = useState("")

    // Step 3 state (additional questions)
    const [dynamicResponses, setDynamicResponses] = useState<Record<string, any>>({})

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

    const addJob = () => setJobs(prev => [...prev, { id: Date.now(), company: "", position: "", startDate: "", isCurrent: false }])
    const removeJob = (id: number) => setJobs(prev => prev.filter(j => j.id !== id))
    const updateJob = (id: number, field: string, value: any) =>
        setJobs(prev => prev.map(j => j.id === id ? { ...j, [field]: value } : j))

    // Handle dynamically populated Status options
    const statusQ = questions.find(q => q.standardKey === 'current_status')
    const STATUS_OPTIONS = BASE_STATUS_OPTIONS.map((opt, i) => {
        if (statusQ && statusQ.optionsEn && statusQ.optionsId) {
            return {
                ...opt,
                labelEn: statusQ.optionsEn[i] || opt.labelEn,
                labelId: statusQ.optionsId[i] || opt.labelId,
            }
        }
        return opt
    })

    const handleSubmit = async () => {
        setLoading(true)

        const statusLabel = STATUS_OPTIONS.find(s => s.id === currentStatus)
        const statusText = lang === 'id' ? statusLabel?.labelId : statusLabel?.labelEn

        const responses: Record<string, any> = {
            ...dynamicResponses,
            status: statusText || currentStatus,
            university: university || null,
            major: major || null,
            jalurMasuk: jalurMasuk || null,
            aktivitas: aktivitas || null,
        }

        // Also save status to the standard question if it exists
        if (statusQ) responses[statusQ.id] = statusText || currentStatus

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
    const isNotWorking = currentStatus === "not_working"

    const STEP_LABELS = lang === 'id'
        ? ["Verifikasi", "Status Saat Ini", "Pertanyaan Tambahan"]
        : ["Verify", "Current Status", "Additional Questions"]

    // Handle nested universities/majors
    const univNames = universities.map(u => u.name)
    const selectedUnivObj = universities.find(u => u.name.toLowerCase() === university.toLowerCase())
    const majorNames = selectedUnivObj 
        ? selectedUnivObj.programs.map(p => p.level ? `${p.name} (${p.level})` : p.name)
        : [] // If no university matches, empty options so user can free-text

    // Custom questions only
    const additionalQuestions = questions.filter(q => !q.isStandard)

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
                                    {lang === 'id' ? (statusQ?.questionId || "Status Saat Ini") : (statusQ?.questionEn || "Current Status")}
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
                                    </h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {lang === 'id' ? "Perguruan Tinggi" : "University / College"}
                                            </label>
                                            <SearchableSelect
                                                options={univNames}
                                                value={university}
                                                onChange={(val) => { setUniversity(val); setMajor(""); }} // Reset major when univ changes
                                                placeholder={lang === 'id' ? "Pilih atau ketik nama kampus" : "Select or type university"}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {lang === 'id' ? "Program Studi" : "Major / Program"}
                                            </label>
                                            <SearchableSelect
                                                options={majorNames}
                                                value={major}
                                                onChange={setMajor}
                                                placeholder={lang === 'id' ? "Pilih atau ketik prodi" : "Select or type major"}
                                            />
                                        </div>
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                {lang === 'id' ? "Jalur Masuk" : "Admission Path"}
                                            </label>
                                            <select
                                                value={jalurMasuk}
                                                onChange={(e) => setJalurMasuk(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                            >
                                                <option value="">{lang === 'id' ? "-- Pilih Jalur Masuk --" : "-- Select Path --"}</option>
                                                <option value="SNBP (Prestasi)">SNBP (Prestasi)</option>
                                                <option value="SNBT (Tes)">SNBT (Tes)</option>
                                                <option value="Mandiri">Mandiri</option>
                                                <option value="Kedinasan">Kedinasan</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
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

                            {/* Conditional: Not Working → Rencana Saat Ini */}
                            {isNotWorking && (
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-amber-500" />
                                        {lang === 'id' ? "Aktivitas / Rencana Saat Ini" : "Current Activity / Plan"}
                                    </h3>
                                    <div className="space-y-1.5">
                                        <select
                                            value={aktivitas}
                                            onChange={(e) => setAktivitas(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                        >
                                            <option value="">{lang === 'id' ? "-- Pilih Aktivitas --" : "-- Select Activity --"}</option>
                                            <option value="Sedang mempersiapkan tes masuk kampus (Gap Year)">Sedang mempersiapkan tes masuk kampus (Gap Year)</option>
                                            <option value="Sedang mencari pekerjaan">Sedang mencari pekerjaan</option>
                                            <option value="Mengikuti pelatihan / kursus">Mengikuti pelatihan / kursus</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
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

                            {additionalQuestions.length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-4">No additional questions.</p>
                            )}

                            {additionalQuestions.map((q, qIdx) => (
                                <div key={q.id} className="space-y-3 p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                                            {qIdx + 1}
                                        </span>
                                        <label className="block font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                            {lang === 'id' ? (q.questionId || q.questionEn) : (q.questionEn || q.questionId)}
                                            {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                    </div>
                                    
                                    {q.type === 'Rating' && (
                                        <div className="space-y-3 pl-9">
                                            <div className="flex gap-2 flex-wrap">
                                                {[1, 2, 3, 4, 5].map((num) => {
                                                    const currentRating = dynamicResponses[q.id] || 0
                                                    const isSelected = currentRating === num
                                                    const isFilled = currentRating > 0 && num <= currentRating
                                                    return (
                                                        <button
                                                            key={num}
                                                            onClick={() => setDynamicResponses(prev => ({ ...prev, [q.id]: num }))}
                                                            className={`relative h-12 w-12 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110'
                                                                    : isFilled
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {num}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                                                <span>{lang === 'id' ? '1 = Sangat Tidak Siap / Sangat Kurang' : '1 = Very Poor / Not Ready at All'}</span>
                                                <span>{lang === 'id' ? '5 = Sangat Siap / Sangat Baik' : '5 = Excellent / Very Ready'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {(q.type === 'Text' || q.type === 'Text Area') && (
                                        <div className="pl-9">
                                            <textarea
                                                value={dynamicResponses[q.id] || ""}
                                                onChange={(e) => setDynamicResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                placeholder={lang === 'id' ? "Jawaban Anda..." : "Your answer..."}
                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 min-h-[100px] text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                            />
                                        </div>
                                    )}

                                    {q.type === 'Multiple Choice' && q.optionsEn && (
                                        <div className="space-y-2 pl-9">
                                            {(lang === 'id' ? q.optionsId : q.optionsEn).map((opt: string, idx: number) => (
                                                <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer transition-colors bg-white dark:bg-slate-800/50">
                                                    <input
                                                        type="radio"
                                                        name={`q_${q.id}`}
                                                        value={q.optionsEn[idx]}
                                                        checked={dynamicResponses[q.id] === q.optionsEn[idx]}
                                                        onChange={(e) => setDynamicResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'Checkbox' && q.optionsEn && (
                                        <div className="space-y-2 pl-9">
                                            {(lang === 'id' ? q.optionsId : q.optionsEn).map((opt: string, idx: number) => {
                                                const currentAnswers = dynamicResponses[q.id] ? dynamicResponses[q.id].split(', ') : []
                                                const isChecked = currentAnswers.includes(q.optionsEn[idx])
                                                return (
                                                    <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer transition-colors bg-white dark:bg-slate-800/50">
                                                        <input
                                                            type="checkbox"
                                                            value={q.optionsEn[idx]}
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                let newAnswers = [...currentAnswers]
                                                                if (e.target.checked) {
                                                                    newAnswers.push(val)
                                                                } else {
                                                                    newAnswers = newAnswers.filter(a => a !== val)
                                                                }
                                                                setDynamicResponses(prev => ({ ...prev, [q.id]: newAnswers.join(', ') }))
                                                            }}
                                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:bg-slate-800 dark:border-slate-600"
                                                        />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                                                    </label>
                                                )
                                            })}
                                            {q.isRequired && (
                                                <p className="text-xs text-slate-400 pl-1">{lang === 'id' ? 'Pilih minimal satu opsi' : 'Select at least one option'}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
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

                                        // Step 2 Validation
                                        if (isStudying) {
                                            if (!university || !major || !jalurMasuk) {
                                                showToast(lang === 'id' ? "Mohon lengkapi info perguruan tinggi, program studi, dan jalur masuk." : "Please complete university, major, and admission path info.", "error")
                                                return
                                            }
                                        }
                                        if (isWorking) {
                                            if (jobs.length === 0) {
                                                showToast(lang === 'id' ? "Mohon tambahkan minimal satu riwayat pekerjaan." : "Please add at least one job history.", "error")
                                                return
                                            }
                                            for (const job of jobs) {
                                                if (!job.company || !job.position || !job.startDate) {
                                                    showToast(lang === 'id' ? "Mohon lengkapi nama perusahaan, jabatan, dan tanggal mulai pada riwayat pekerjaan." : "Please complete company, position, and start date for all jobs.", "error")
                                                    return
                                                }
                                            }
                                        }
                                        if (isNotWorking) {
                                            if (!aktivitas) {
                                                showToast(lang === 'id' ? "Mohon pilih aktivitas saat ini." : "Please select current activity.", "error")
                                                return
                                            }
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
                                onClick={() => {
                                    // Validate required additional questions
                                    const missingRequired = additionalQuestions.filter(q => {
                                        if (!q.isRequired) return false;
                                        const answer = dynamicResponses[q.id];
                                        if (q.type === 'Rating') return !answer || answer === 0;
                                        if (q.type === 'Checkbox') {
                                            // Must have at least one option selected
                                            return !answer || String(answer).trim() === "";
                                        }
                                        return !answer || String(answer).trim() === "";
                                    });
                                    if (missingRequired.length > 0) {
                                        const firstMissing = missingRequired[0];
                                        const qLabel = lang === 'id' ? (firstMissing.questionId || firstMissing.questionEn) : (firstMissing.questionEn || firstMissing.questionId);
                                        showToast(lang === 'id' ? `Mohon isi: "${qLabel}"` : `Please answer: "${qLabel}"`, "error");
                                        return;
                                    }
                                    handleSubmit();
                                }}
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
