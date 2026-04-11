"use client"

import { useState } from "react"
import { Search, Plus, Upload, MoreHorizontal, Trash2, Edit, X, Save } from "lucide-react"

import { getStudents, createStudent, updateStudent, deleteStudent } from "./actions"
import { useEffect } from "react"

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStudents()
    }, [])

    const loadStudents = async () => {
        setLoading(true)
        const result = await getStudents()
        if (result.success && result.data) {
            setStudents(result.data)
        }
        setLoading(false)
    }

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedBatch, setSelectedBatch] = useState("All")
    const [isModalOpen, setIsModalOpen] = useState(false)

    // State for Form
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({ name: "", batch: new Date().getFullYear(), phone: "" })

    const batches = ["All", ...Array.from(new Set(students.map(s => s.batch))).sort()]

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm)
        const matchesBatch = selectedBatch === "All" || s.batch.toString() === selectedBatch
        return matchesSearch && matchesBatch
    })

    // Open Modal for Create
    const openAddModal = () => {
        setEditingId(null)
        setFormData({ name: "", batch: new Date().getFullYear(), phone: "" })
        setIsModalOpen(true)
    }

    // Open Modal for Edit
    const openEditModal = (student: any) => {
        setEditingId(student.id)
        setFormData({ name: student.name, batch: student.batch, phone: student.phone })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            await deleteStudent(id)
            loadStudents()
        }
    }

    const handleSave = async () => {
        if (editingId) {
            // Update Existing
            await updateStudent(editingId, formData)
        } else {
            // Create New
            await createStudent(formData)
        }
        loadStudents()
        setIsModalOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold">Student Directory</h1>
                <div className="flex gap-2">
                    <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                        <Upload className="h-4 w-4 mr-2" /> Bulk Upload
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Student
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700"
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
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Batch</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No students found using current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium">{student.name}</td>
                                        <td className="px-6 py-4">{student.batch}</td>
                                        <td className="px-6 py-4">{student.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.responses && student.responses.length > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {student.responses && student.responses.length > 0 ? "Completed" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(student)}
                                                className="text-slate-400 hover:text-blue-600 mr-3"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id, student.name)}
                                                className="text-slate-400 hover:text-red-600"
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

            {/* Add/Edit Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingId ? "Edit Student" : "Add New Student"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Batch (Year)</label>
                                <input
                                    type="number"
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: Number(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name || !formData.phone}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editingId ? "Update Student" : "Save Student"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
