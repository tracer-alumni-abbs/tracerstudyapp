export default function AdminLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200/60 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 p-6 h-32" />
                ))}
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 h-64" />
        </div>
    )
}
