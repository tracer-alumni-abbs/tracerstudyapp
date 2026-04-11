"use client"

import Link from "next/link"
import { ArrowRight, GraduationCap, LayoutDashboard } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function Home() {
  const { t } = useLanguage()
  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] dark:bg-blue-600/10" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] dark:bg-indigo-600/10" />
      </div>

      <div className="z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">

        {/* Badge / Pill */}
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
          Official Tracer Study Platform
        </div>

        {/* School Name & Title */}
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-lg md:text-xl font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Sekolah Menengah Atas Al Abidin Bilingual Boarding School Surakarta
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 pb-2">
            {t.hero.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <Link
            href="/search"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-105 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
          >
            <span className="mr-2 text-lg">{t.hero.startBtn}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/admin/dashboard"
            className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 font-medium text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            <span>{t.hero.adminBtn}</span>
          </Link>
        </div>

        {/* Footer Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full text-left px-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <div className="p-6 rounded-2xl bg-white/50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 dark:bg-blue-900/30 dark:text-blue-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.hero.features.connect.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.hero.features.connect.desc}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 dark:bg-indigo-900/30 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.hero.features.track.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.hero.features.track.desc}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-4 dark:bg-violet-900/30 dark:text-violet-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.hero.features.improve.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.hero.features.improve.desc}</p>
          </div>
        </div>

        <div className="mt-16 text-sm text-slate-400 animate-in fade-in duration-1000 delay-500">
          © {new Date().getFullYear()} Sekolah Menengah Atas Al Abidin Bilingual Boarding School Surakarta. All rights reserved.
        </div>
      </div>
    </main>
  )
}
