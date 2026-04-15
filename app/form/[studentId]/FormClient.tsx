"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react"

import { verifyIdentity, submitSurvey } from "./actions"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function FormClient({ studentId, initialProfile }: { studentId: string, initialProfile: any }) {
    const { t } = useLanguage()
    const router = useRouter()
    
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    // Direction of animation: 'forward' or 'back'
    const [animKey, setAnimKey] = useState(0)
    const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward')

    // Form State gets populated instantly without mounting wait
    const [profile, setProfile] = useState<any>(initialProfile)
    const [jobs, setJobs] = useState<any[]>([])
    const [responses, setResponses] = useState<Record<string, any>>({})

    // Toast Notification State
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Verification State
    const [birthDate, setBirthDate] = useState("")
    const [verificationError, setVerificationError] = useState("")
    const [verifying, setVerifying] = useState(false)

    const goToStep = (nextStep: number, dir: 'forward' | 'back' = 'forward') => {
        setSlideDir(dir)
        setAnimKey(k => k + 1)
        setStep(nextStep)
    }

    const addJob = () => {
        setJobs([...jobs, {
            id: Date.now(),
            company: "",
            position: "",
            startDate: "",
            isCurrent: false
        }])
    }

    const removeJob = (id: number) => {
        setJobs(jobs.filter(j => j.id !== id))
    }

    const updateJob = (id: number, field: string, value: any) => {
        setJobs(jobs.map(j => j.id === id ? { ...j, [field]: value } : j))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const result = await submitSurvey(studentId, profile, jobs, responses)
        setLoading(false)

        if (result.success) {
            router.push(`/thank-you?name=${encodeURIComponent(profile.name || "")}`)
        } else {
            showToast(result.message || "An error occurred during submission", 'error')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 relative">
            {/* slide-in CSS animation */}
            <style>{`
                @keyframes slide-in-forward {
                    from { opacity: 0; transform: translateX(32px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-back {
                    from { opacity: 0; transform: translateX(-32px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .step-forward { animation: slide-in-forward 0.25s cubic-bezier(0.22,1,0.36,1) both; }
                .step-back    { animation: slide-in-back    0.25s cubic-bezier(0.22,1,0.36,1) both; }
            `}</style>
            <div className="absolute top-6 right-6 z-50">
                <LanguageSwitcher />
            </div>
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                        <span className={step >= 1 ? "text-blue-600" : ""}>{t.form.step1.title} </span>
                        <span className={step >= 2 ? "text-blue-600" : ""}>{t.form.step2.title}</span>
                        <span className={step >= 3 ? "text-blue-600" : ""}>{t.form.step3.title}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 overflow-hidden">

                    {/* Step 1: Profile */}
                    {step === 1 && (
                        <div key={animKey} className={`space-y-6 ${slideDir === 'forward' ? 'step-forward' : 'step-back'}`}>
                            <h2 className="text-2xl font-bold">{t.form.step1.title}</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.form.step1.name}</label>
                                    <input disabled value={profile.name} className="mt-1 block w-full rounded-md border-slate-300 bg-slate-100 px-3 py-2 text-slate-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.form.step1.batch}</label>
                                    <input disabled value={profile.batch} className="mt-1 block w-full rounded-md border-slate-300 bg-slate-100 px-3 py-2 text-slate-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.form.step1.phone}</label>
                                    <input
                                        value={profile.phone || ""}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.form.step1.email}</label>
                                    <input
                                        value={profile.email || ""}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        {t.form.step1.birthDate} <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">{t.form.step1.verificationNote}</p>
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => {
                                            setBirthDate(e.target.value)
                                            setVerificationError("")
                                        }}
                                        className={`block w-full md:w-1/2 rounded-md border ${verificationError ? 'border-red-500' : 'border-slate-300'} bg-white px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700`}
                                    />
                                    {verificationError && (
                                        <p className="text-red-500 text-sm mt-1">{verificationError}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Job History */}
                    {step === 2 && (
                        <div key={animKey} className={`space-y-6 ${slideDir === 'forward' ? 'step-forward' : 'step-back'}`}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">{t.form.step2.title}</h2>
                                <button onClick={addJob} className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-transform">
                                    <Plus className="h-4 w-4 mr-1" /> {t.form.step2.addPosition}
                                </button>
                            </div>

                            {jobs.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                                    {t.form.step2.noJobs}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map((job, index) => (
                                        <div key={job.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative group">
                                            <button onClick={() => removeJob(job.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 active:scale-90 transition-transform">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <div className="grid gap-4 md:grid-cols-2 pr-8">
                                                <input
                                                    placeholder={t.form.step2.company}
                                                    value={job.company}
                                                    onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                                                    className="rounded-md border border-slate-300 px-3 py-2"
                                                />
                                                <input
                                                    placeholder={t.form.step2.position}
                                                    value={job.position}
                                                    onChange={(e) => updateJob(job.id, 'position', e.target.value)}
                                                    className="rounded-md border border-slate-300 px-3 py-2"
                                                />
                                                <input
                                                    type="date"
                                                    value={job.startDate}
                                                    onChange={(e) => updateJob(job.id, 'startDate', e.target.value)}
                                                    className="rounded-md border border-slate-300 px-3 py-2"
                                                />
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={job.isCurrent}
                                                        onChange={(e) => updateJob(job.id, 'isCurrent', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">{t.form.step2.isCurrent}</label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Survey Questions */}
                    {step === 3 && (
                        <div key={animKey} className={`space-y-6 ${slideDir === 'forward' ? 'step-forward' : 'step-back'}`}>
                            <h2 className="text-2xl font-bold">{t.form.step3.title}</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block font-medium text-slate-900 dark:text-slate-200">{t.form.step3.questions.q1}</label>
                                    <div className="space-y-2">
                                        {[t.form.step3.questions.options.employed, t.form.step3.questions.options.selfEmployed, t.form.step3.questions.options.unemployed, t.form.step3.questions.options.student].map((opt) => (
                                            <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="q1"
                                                    value={opt}
                                                    onChange={(e) => setResponses({ ...responses, q1: e.target.value })}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-medium text-slate-900 dark:text-slate-200">{t.form.step3.questions.q2}</label>
                                    <div className="flex gap-4">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setResponses({ ...responses, q2: num })}
                                                className={`h-10 w-10 rounded-full font-bold transition-all ${responses['q2'] === num
                                                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-medium text-slate-900 dark:text-slate-200">{t.form.step3.questions.q3}</label>
                                    <textarea
                                        className="w-full rounded-md border border-slate-300 p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setResponses({ ...responses, q3: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-10 flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                        {step > 1 ? (
                            <button
                                onClick={() => goToStep(step - 1, 'back')}
                                className="flex items-center px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all active:scale-95"
                                disabled={loading}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> {t.form.step1.backBtn}
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/search')}
                                className="flex items-center px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <Search className="h-4 w-4 mr-2" /> {t.form.step1.backToSearch}
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={async () => {
                                    if (step === 1) {
                                        if (!birthDate) {
                                            setVerificationError(t.validation.required)
                                            return
                                        }
                                        setVerifying(true)
                                        const result = await verifyIdentity(studentId, birthDate)
                                        setVerifying(false)

                                        if (result.success) {
                                            goToStep(step + 1, 'forward')
                                        } else {
                                            setVerificationError(result.message || t.validation.error)
                                        }
                                    } else {
                                        goToStep(step + 1, 'forward')
                                    }
                                }}
                                disabled={verifying}
                                className="flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {verifying ? (
                                    <><span className="mr-2">{t.form.step1.verifying}</span><Loader2 className="h-4 w-4 animate-spin" /></>
                                ) : (
                                    <><span className="mr-2">{t.form.step1.verifyBtn}</span><ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {loading ? t.form.step3.submitting : t.form.step3.submitBtn} <CheckCircle2 className="h-4 w-4 ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                        toast.type === 'success' 
                            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400' 
                            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <p className="font-medium text-sm">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
