"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import { MessageSquare, Star, PieChart as PieChartIcon, AlignLeft } from "lucide-react"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function SurveyAnalytics({ questions }: { questions: any[] }) {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
                Detailed Survey Summaries
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
                {questions.map((q, idx) => (
                    <div key={q.id} className="rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold tracking-tight break-words">{idx + 1}. {q.question}</h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                {q.type === 'Multiple Choice' ? <PieChartIcon className="w-3 h-3" /> :
                                 q.type === 'Rating' ? <Star className="w-3 h-3" /> :
                                 <AlignLeft className="w-3 h-3" />}
                                {q.responses?.length || 0} responses
                            </p>
                        </div>
                        <div className="mt-4">
                            {renderChartContents(q)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function renderChartContents(q: any) {
    if (!q.responses || q.responses.length === 0) {
        return <div className="text-sm text-slate-500 h-[250px] flex items-center justify-center">No responses yet.</div>
    }

    if (q.type === "Multiple Choice") {
        // Group by answer
        const counts: Record<string, number> = {}
        q.responses.forEach((r: any) => {
            counts[r.answer] = (counts[r.answer] || 0) + 1
        })
        const data = Object.keys(counts).map(key => ({ name: key, value: counts[key] }))

        return (
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        )
    }

    if (q.type === "Rating") {
       // Group 1-5
       const data = [1,2,3,4,5].map(v => ({ name: `${v} Stars`, value: 0, raw: v }))
       let totalScore = 0;
       q.responses.forEach((r: any) => {
           const num = parseInt(r.answer)
           if (!isNaN(num) && num >= 1 && num <= 5) {
               data[num - 1].value += 1
               totalScore += num;
           }
       })
       const avg = (totalScore / q.responses.length).toFixed(1)

       return (
            <div>
                 <div className="flex items-end gap-2 mb-4">
                     <span className="text-3xl font-bold">{avg}</span>
                     <div className="flex text-amber-400 mb-1">
                         {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= parseFloat(avg) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />)}
                     </div>
                 </div>
                 <div className="h-[200px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={50} />
                             <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                             <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
            </div>
       )
    }

    // Text or Text Area responses
    return (
        <div className="h-[250px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {q.responses.map((r: any, idx: number) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300">"{r.answer}"</p>
                    {r.student && <p className="text-xs text-slate-400 mt-2">— {r.student.name || 'Anonymous'}</p>}
                </div>
            ))}
        </div>
    )
}
