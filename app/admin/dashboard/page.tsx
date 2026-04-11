import prisma from "@/lib/prisma"
import DashboardChart from "./DashboardChart"
import { Users, BarChart3, Briefcase, Activity, Clock } from "lucide-react"

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

function SimpleCard({ title, value, sub, icon: Icon, colorClass, textColorClass }: { title: string, value: string | number, sub: string, icon: any, colorClass: string, textColorClass: string }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-slate-800/60 dark:bg-slate-900/60">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${colorClass}`} />
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-10 dark:bg-opacity-20 ${colorClass}`}>
                    <Icon className={`h-5 w-5 ${textColorClass}`} />
                </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
                <span className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-slate-400">{value}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sub}</div>
        </div>
    )
}

async function getDashboardData() {
    const [totalAlumni, responses, jobHistories, recentActivity] = await Promise.all([
        prisma.student.count(),
        prisma.surveyResponse.findMany({ select: { studentId: true } }),
        prisma.jobHistory.findMany({ where: { isCurrent: true } }),
        prisma.surveyResponse.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { student: true, question: true }
        })
    ])

    const uniqueResponders = new Set(responses.map(r => r.studentId)).size;
    const responseRate = totalAlumni > 0 ? Math.round((uniqueResponders / totalAlumni) * 100) : 0;

    const uniqueEmployed = new Set(jobHistories.map(j => j.studentId)).size;
    const employedRate = totalAlumni > 0 ? Math.round((uniqueEmployed / totalAlumni) * 100) : 0;

    let employed = 0;
    let selfEmployed = 0;
    let studying = 0;

    jobHistories.forEach(j => {
        const pos = j.position.toLowerCase();
        const company = j.company.toLowerCase();
        
        if (pos.includes("student") || pos.includes("mahasiswa") || pos.includes("pelajar") || company.includes("universitas") || company.includes("university")) {
            studying++;
        } else if (pos.includes("freelance") || company.includes("self") || company.includes("wiraswasta") || pos.includes("founder") || pos.includes("ceo")) {
            selfEmployed++;
        } else {
            employed++;
        }
    });

    const unemployed = totalAlumni - uniqueEmployed;

    const chartData = [
        { name: "Employed", total: employed },
        { name: "Self-Employed", total: selfEmployed },
        { name: "Studying", total: studying },
        { name: "Unemployed", total: unemployed },
    ]

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const pendingReview = await prisma.surveyResponse.count({
        where: { createdAt: { gte: sevenDaysAgo } }
    });

    return {
        totalAlumni,
        responseRate,
        employedRate,
        pendingReview,
        chartData,
        recentActivity
    }
}

export const revalidate = 0; // Ensure data is always fresh

export default async function AdminDashboard() {
    const data = await getDashboardData();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl px-4 py-2 rounded-full border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                    <Clock className="w-4 h-4" />
                    <span>Real-time data enabled</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <SimpleCard 
                    title="Total Alumni" 
                    value={data.totalAlumni} 
                    sub="Registered in database" 
                    icon={Users} 
                    colorClass="bg-blue-500" 
                    textColorClass="text-blue-500" 
                />
                <SimpleCard 
                    title="Response Rate" 
                    value={`${data.responseRate}%`} 
                    sub="Overall completion rate" 
                    icon={Activity} 
                    colorClass="bg-emerald-500" 
                    textColorClass="text-emerald-500" 
                />
                <SimpleCard 
                    title="Employed Rate" 
                    value={`${data.employedRate}%`} 
                    sub="Currently with active jobs" 
                    icon={Briefcase} 
                    colorClass="bg-purple-500" 
                    textColorClass="text-purple-500" 
                />
                <SimpleCard 
                    title="Recent Responses" 
                    value={data.pendingReview} 
                    sub="Submissions within last 7 days" 
                    icon={BarChart3} 
                    colorClass="bg-amber-500" 
                    textColorClass="text-amber-500" 
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="mb-6 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
                        <h3 className="text-lg font-semibold tracking-tight">Employment Status</h3>
                    </div>
                    <DashboardChart data={data.chartData} />
                </div>

                <div className="col-span-3 rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="mb-6 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
                        <h3 className="text-lg font-semibold tracking-tight">Recent Activity</h3>
                    </div>
                    
                    {data.recentActivity.length > 0 ? (
                        <div className="space-y-6">
                            {data.recentActivity.map((activity, i) => (
                                <div key={activity.id} className="group flex items-start gap-4 transition-all">
                                    <div className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 bg-gradient-to-br from-blue-100 to-blue-50 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 dark:text-blue-400 dark:ring-blue-900">
                                        {activity.student.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="grid flex-1 gap-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {activity.student.name}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
                                            Responded to: {activity.question.question}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                            Batch {activity.student.batch} • {timeAgo(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[250px] items-center justify-center text-sm text-slate-500 dark:text-slate-400 flex-col gap-2">
                           <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600 opacity-50" />
                           <p>No recent activity found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
