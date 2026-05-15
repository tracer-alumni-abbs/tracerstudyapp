export default function OptionsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-44 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                    <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                {[0, 1].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                            <div className="h-8 w-24 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />
                        </div>
                        <div className="p-4 space-y-2">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50" style={{ animationDelay: `${j * 40}ms` }}>
                                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                    <div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
