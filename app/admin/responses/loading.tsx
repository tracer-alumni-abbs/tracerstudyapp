export default function ResponsesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                <div className="h-9 w-36 bg-green-100 dark:bg-green-900/30 rounded-lg animate-pulse" />
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
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse" style={{ animationDelay: `${i * 40}ms` }}>
                            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            <div className="h-4 w-14 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" />
                            <div className="flex gap-2">
                                <div className="h-7 w-14 bg-blue-50 dark:bg-blue-900/20 rounded-lg" />
                                <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
