"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye, X, User, Briefcase, GraduationCap, Trash2 } from "lucide-react"
import { getSurveyResponses, deleteResponseItem } from "./actions"

export default function ResponsesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedBatch, setSelectedBatch] = useState("All")
    const [selectedResponse, setSelectedResponse] = useState<any | null>(null)
    const [responses, setResponses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const res = await getSurveyResponses()
        if (res.success && res.data) {
            setResponses(res.data)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this response?")) {
            await deleteResponseItem(id)
            loadData()
        }
    }

    const batches = ["All", ...Array.from(new Set(responses.map(s => s.batch))).sort()]

    const filteredResponses = responses.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.company.toLowerCase().includes(searchTerm)
        const matchesBatch = selectedBatch === "All" || r.batch.toString() === selectedBatch
        return matchesSearch && matchesBatch
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Survey Responses</h1>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" /> Export to CSV
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search responses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700"
                    >
                        {batches.map(b => (
                            <option key={b} value={b}>{b === "All" ? "All Batches" : b}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Batch</th>
                                <th className="px-6 py-3">Submission Date</th>
                                <th className="px-6 py-3">Employment Status</th>
                                <th className="px-6 py-3">Current Company</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Loading responses...
                                    </td>
                                </tr>
                            ) : filteredResponses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No responses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredResponses.map((res) => (
                                    <tr key={res.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium">{res.name}</td>
                                        <td className="px-6 py-4">{res.batch}</td>
                                        <td className="px-6 py-4">{res.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{res.company}</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setSelectedResponse(res)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center"
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </button>
                                            <button
                                                onClick={() => handleDelete(res.id)}
                                                className="text-red-500 hover:text-red-700 font-medium text-xs"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Response Detail Modal */}
            {selectedResponse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
                                    {selectedResponse.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedResponse.name}</h2>
                                    <p className="text-sm text-slate-500">Batch {selectedResponse.batch} • {selectedResponse.date}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedResponse(null)} className="text-slate-400 hover:text-red-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            {/* Employment Status Section */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                    <Briefcase className="h-4 w-4 mr-2" /> Employment info
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <label className="text-xs text-slate-500">Current Status</label>
                                        <p className="font-medium text-lg">{selectedResponse.status}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <label className="text-xs text-slate-500">Company</label>
                                        <p className="font-medium text-lg">{selectedResponse.company}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <label className="text-xs text-slate-500">Position</label>
                                        <p className="font-medium text-lg">{selectedResponse.position}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <label className="text-xs text-slate-500">Est. Salary</label>
                                        <p className="font-medium text-lg">{selectedResponse.salary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum Relevance Section */}
                            <div className="space-y-4">
                                <h3 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                    <GraduationCap className="h-4 w-4 mr-2" /> Academic Impact
                                </h3>
                                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                                    <span>Study Relevance Rating</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <div
                                                key={star}
                                                className={`h-3 w-3 rounded-full ${(selectedResponse.relevant || 0) >= star ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedResponse(null)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 font-medium text-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
