export default function StudentsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="h-8 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-9 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-9 w-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                    <div className="h-10 flex-1 max-w-sm bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse" style={{ animationDelay: `${i * 40}ms` }}>
                            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full ml-auto" />
                            <div className="flex gap-2">
                                <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
