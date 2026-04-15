"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { Home, Star, Heart, Sparkles, GraduationCap, ArrowRight } from "lucide-react"

const QUOTES = [
    "Kesuksesan bukan hanya tentang apa yang kamu capai, tapi tentang siapa kamu jadikan dirimu dalam prosesnya.",
    "Setiap langkah kecil yang kamu ambil hari ini adalah fondasi dari pencapaian besar di masa depan.",
    "Ilmu yang kamu dapatkan di ABBS adalah bekal terbaik untuk menghadapi dunia yang terus berubah.",
    "Perjalananmu baru dimulai. Yang terbaik masih ada di depan.",
    "Alumni yang sukses bukan hanya mereka yang berhasil secara materi, tapi yang memberikan dampak nyata bagi sekitarnya.",
]

function Particle({ style }: { style: React.CSSProperties }) {
    return (
        <div
            className="absolute rounded-full opacity-0 pointer-events-none"
            style={style}
        />
    )
}

function ThankYouContent() {
    const searchParams = useSearchParams()
    const name = searchParams.get("name") || ""
    const firstName = name.split(" ")[0]

    const [visible, setVisible] = useState(false)
    const [checkVisible, setCheckVisible] = useState(false)
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 100)
        const t2 = setTimeout(() => setCheckVisible(true), 400)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        style: {
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: [
                "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"
            ][Math.floor(Math.random() * 6)],
            animation: `float-particle ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: 0.4 + Math.random() * 0.3,
        } as React.CSSProperties,
    }))

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex flex-col items-center justify-center px-4 py-16">
            <style>{`
                @keyframes float-particle {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
                    50%       { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
                }
                @keyframes check-draw {
                    from { stroke-dashoffset: 100; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes ring-pulse {
                    0%   { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes badge-pop {
                    0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
                    70%  { transform: scale(1.1) rotate(3deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .slide-up-1 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.5s both; }
                .slide-up-2 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.7s both; }
                .slide-up-3 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.9s both; }
                .slide-up-4 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 1.1s both; }
                .slide-up-5 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 1.3s both; }
                .badge-pop  { animation: badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
            `}</style>

            {/* Background decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-400/5 dark:bg-emerald-600/10 rounded-full blur-[80px]" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => <Particle key={p.id} style={p.style} />)}
            </div>

            {/* School badge */}
            <div className="badge-pop flex items-center gap-2 mb-10 px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-full shadow-sm">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide">
                    Al Abidin Bilingual Boarding School
                </span>
            </div>

            {/* Animated success ring + check */}
            <div className="slide-up-1 relative mb-8 flex items-center justify-center">
                {/* Pulsing rings */}
                {checkVisible && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-emerald-400/20 dark:bg-emerald-500/20" style={{ animation: "ring-pulse 2s ease-out infinite" }} />
                        <div className="absolute inset-0 rounded-full bg-emerald-400/15 dark:bg-emerald-500/15" style={{ animation: "ring-pulse 2s ease-out 0.5s infinite" }} />
                    </>
                )}
                <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_60px_rgba(52,211,153,0.4)] flex items-center justify-center">
                    <svg viewBox="0 0 52 52" className="h-14 w-14" fill="none">
                        <circle cx="26" cy="26" r="25" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
                        {checkVisible && (
                            <polyline
                                points="14.1,27.2 21.1,34.2 37.9,17.2"
                                fill="none"
                                stroke="white"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="100"
                                style={{ animation: "check-draw 0.5s ease-out 0.1s both" }}
                            />
                        )}
                    </svg>
                </div>

                {/* Corner sparkles */}
                <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <Star className="absolute -bottom-1 -left-2 h-5 w-5 text-blue-400 animate-bounce" style={{ animationDelay: "0.5s" }} />
            </div>

            {/* Main content card */}
            <div className="relative z-10 w-full max-w-lg text-center">
                {/* Headline */}
                <div className="slide-up-2 mb-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-violet-300 bg-clip-text text-transparent leading-tight">
                        {firstName ? `Terima kasih, ${firstName}!` : "Terima kasih!"}
                    </h1>
                </div>

                {/* Sub headline */}
                <div className="slide-up-3 mb-8">
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                        Respons kamu telah berhasil kami terima. <br className="hidden sm:block" />
                        Data ini sangat berarti bagi perkembangan <span className="font-semibold text-blue-600 dark:text-blue-400">ABBS Surakarta</span>.
                    </p>
                </div>

                {/* Quote card */}
                <div className="slide-up-4 mb-10">
                    <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                        {/* Quote marks */}
                        <div className="absolute -top-3 left-6 text-5xl text-blue-300/50 dark:text-blue-700/50 font-serif leading-none select-none">"</div>
                        <p className="relative text-slate-700 dark:text-slate-200 text-base leading-relaxed italic font-medium pt-2 px-2">
                            {quote}
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <Heart className="h-3.5 w-3.5 text-rose-400" />
                            Semoga sukses di jalan yang kamu pilih
                        </div>
                    </div>
                </div>

                {/* Three icons info row */}
                <div className="slide-up-4 grid grid-cols-3 gap-4 mb-10">
                    {[
                        { emoji: "🎓", label: "Alumni Terdaftar", sub: "Data tersimpan" },
                        { emoji: "📊", label: "Data Diproses", sub: "Analisis berjalan" },
                        { emoji: "🌟", label: "Kontribusi Nyata", sub: "Untuk generasi" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 backdrop-blur-sm">
                            <span className="text-2xl">{item.emoji}</span>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</p>
                        </div>
                    ))}
                </div>

                {/* CTA button */}
                <div className="slide-up-5">
                    <Link href="/">
                        <button className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.7)] hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2">
                            <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                            Kembali ke Halaman Utama
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                    <p className="mt-4 text-xs text-slate-400 dark:text-slate-600">
                        Kamu dapat menutup tab ini atau kembali ke halaman utama
                    </p>
                </div>
            </div>
        </main>
    )
}

export default function ThankYouPage() {
    return (
        <Suspense>
            <ThankYouContent />
        </Suspense>
    )
}
