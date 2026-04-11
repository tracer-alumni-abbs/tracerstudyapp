"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Assuming I'll create this or mock it
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Simple Card components if shadcn not fully set up
function SimpleCard({ title, value, sub }: { title: string, value: string, sub: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-xs text-green-500">{sub}</span>
            </div>
        </div>
    )
}

const DATA = [
    { name: "Employed", total: 120 },
    { name: "Self-Employed", total: 45 },
    { name: "Studying", total: 30 },
    { name: "Unemployed", total: 15 },
]

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <div className="text-sm text-slate-500">Last updated: Today</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SimpleCard title="Total Alumni" value="450" sub="+12% from last month" />
                <SimpleCard title="Response Rate" value="68%" sub="+5% increase" />
                <SimpleCard title="Employed" value="82%" sub="High employment rate" />
                <SimpleCard title="Pending Review" value="12" sub="Requires attention" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="p-6">
                        <h3 className="font-semibold mb-4">Employment Status</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DATA}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-xs font-bold text-blue-600">
                                    A
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium">New survey response</p>
                                    <p className="text-xs text-slate-500">Alumni 2021 changed job • 2h ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
