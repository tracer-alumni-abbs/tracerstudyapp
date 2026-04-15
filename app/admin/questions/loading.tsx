export default function QuestionsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
                <div className="h-9 w-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse" />
            </div>

            {/* Questions list */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="h-6 w-5 bg-slate-200 dark:bg-slate-700 rounded mt-1 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                    <div className="h-5 w-20 bg-blue-50 dark:bg-blue-900/30 rounded-full" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
