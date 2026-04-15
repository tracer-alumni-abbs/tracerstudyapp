export default function AdminsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-4 w-52 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
                <div className="h-9 w-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse" />
            </div>

            {/* Admin cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                            <div className="space-y-2">
                                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            </div>
                        </div>
                        <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}
