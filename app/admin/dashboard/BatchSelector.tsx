"use client"

import { Filter } from "lucide-react"

export default function BatchSelector({ currentBatch, batches }: { currentBatch: string, batches: number[] }) {
    return (
        <form className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative z-10">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch:</span>
            <select 
                name="batch" 
                defaultValue={currentBatch}
                className="bg-transparent text-sm border-none outline-none font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                onChange={(e) => e.target.form?.submit()}
            >
                <option value="All">All Batches</option>
                {batches.map((b: number) => (
                    <option key={b} value={b.toString()}>{b}</option>
                ))}
            </select>
            <noscript><button type="submit" className="text-xs ml-2 underline">Go</button></noscript>
        </form>
    )
}
