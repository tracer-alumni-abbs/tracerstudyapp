"use client"

import Link from "next/link"
import { ArrowRight, GraduationCap, LayoutDashboard, Sparkles, Network, Activity } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { motion } from "framer-motion"

// Variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 15 }
  },
}

const floatingVariants = {
  float: {
    y: [0, -15, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

const floatingVariantsReverse = {
  float: {
    y: [0, 20, 0],
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: 0.5
    }
  }
}

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-blue-200 dark:selection:bg-blue-900">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-6 right-6 z-50"
      >
        <LanguageSwitcher />
      </motion.div>

      {/* Dynamic Background Mesh / Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {/* Animated gradients */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] dark:bg-blue-600/20" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px] dark:bg-violet-600/20" 
        />
        
        {/* Floating Decorative Elements */}
        <motion.div variants={floatingVariants} animate="float" className="absolute top-[20%] left-[10%] opacity-20 dark:opacity-30">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </motion.div>
        <motion.div variants={floatingVariantsReverse} animate="float" className="absolute top-[30%] right-[15%] opacity-20 dark:opacity-30">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-500">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </motion.div>
        <motion.div variants={floatingVariants} animate="float" className="absolute bottom-[25%] left-[20%] opacity-20 dark:opacity-30">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500">
            <polygon points="12 2 2 22 22 22" />
          </svg>
        </motion.div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center mt-12 md:mt-0 py-20 pb-12">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full max-w-6xl"
        >
          {/* Badge / Pill */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-blue-200/60 bg-blue-50/60 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-blue-800 mb-8 shadow-sm dark:border-blue-800/50 dark:bg-blue-900/40 dark:text-blue-300 dark:shadow-blue-900/20"
          >
            <span className="relative flex h-2.5 w-2.5 mr-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400"></span>
            </span>
            Official Tracer Study Platform
            <Sparkles className="h-3.5 w-3.5 ml-2 text-blue-500 dark:text-blue-400" />
          </motion.div>

          {/* School Name & Title */}
          <motion.div variants={itemVariants} className="space-y-6 w-full px-2 max-w-5xl">
            <h2 className="text-sm md:text-base lg:text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Sekolah Menengah Atas Al Abidin Bilingual Boarding School Surakarta
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-300 dark:to-violet-400 drop-shadow-sm pb-2 leading-tight">
              {t.hero.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-light mt-4">
              {t.hero.subtitle}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mt-12 w-full sm:w-auto px-4 z-20">
            <Link href="/search" className="w-full sm:w-auto pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex w-full sm:inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-blue-600 px-10 font-semibold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-700 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              >
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
                <span className="mr-3 text-lg relative z-10">{t.hero.startBtn}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" />
              </motion.button>
            </Link>

            <Link href="/admin/dashboard" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex w-full sm:inline-flex h-16 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 backdrop-blur-xl px-10 font-semibold text-slate-800 shadow-sm transition-all hover:bg-white hover:text-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
              >
                <LayoutDashboard className="mr-3 h-5 w-5 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="text-lg">{t.hero.adminBtn}</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Footer Features */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-24 w-full text-left perspective-1000"
          >
            {[
              {
                icon: GraduationCap,
                title: t.hero.features.connect.title,
                desc: t.hero.features.connect.desc,
                colorClass: "bg-blue-400/10",
                iconBgClass: "bg-blue-100/80 dark:bg-blue-900/40 ring-blue-500/20",
                iconColorClass: "text-blue-600 dark:text-blue-400"
              },
              {
                icon: Network,
                title: t.hero.features.track.title,
                desc: t.hero.features.track.desc,
                colorClass: "bg-indigo-400/10",
                iconBgClass: "bg-indigo-100/80 dark:bg-indigo-900/40 ring-indigo-500/20",
                iconColorClass: "text-indigo-600 dark:text-indigo-400"
              },
              {
                icon: Activity,
                title: t.hero.features.improve.title,
                desc: t.hero.features.improve.desc,
                colorClass: "bg-violet-400/10",
                iconBgClass: "bg-violet-100/80 dark:bg-violet-900/40 ring-violet-500/20",
                iconColorClass: "text-violet-600 dark:text-violet-400"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -10, rotateX: 5, rotateY: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group p-8 rounded-3xl bg-white/40 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:bg-slate-900/40 dark:border-slate-700/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.colorClass} rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150`} />
                <div className={`h-14 w-14 rounded-2xl ${feature.iconBgClass} ${feature.iconColorClass} flex items-center justify-center mb-6 shadow-inner ring-1 transition-transform duration-300 group-hover:-translate-y-1`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-100">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-20 text-sm font-medium text-slate-400/80 dark:text-slate-500/80"
        >
          © {new Date().getFullYear()} Sekolah Menengah Atas Al Abidin Bilingual Boarding School Surakarta.<br className="sm:hidden" /> All rights reserved.
        </motion.div>
      </div>
    </main>
  )
}
