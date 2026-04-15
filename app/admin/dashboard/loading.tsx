export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>

            {/* Stat cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 p-6 h-36 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
                        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-2xl border border-slate-200/60 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 p-6 animate-pulse">
                    <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6" />
                    <div className="h-52 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>
                <div className="col-span-3 rounded-2xl border border-slate-200/60 bg-white/60 dark:bg-slate-900/60 dark:border-slate-800/60 p-6 animate-pulse">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6" />
                    <div className="space-y-5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                    <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
