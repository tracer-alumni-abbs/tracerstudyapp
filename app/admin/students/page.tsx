"use client"

import { useState } from "react"
import { Search, Plus, Upload, Trash2, Edit, X, Save, DownloadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { getStudents, createStudent, updateStudent, deleteStudent, bulkCreateStudents } from "./actions"
import { useEffect, useRef } from "react"

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Bulk Upload Modal State
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)
    const [bulkDataPreview, setBulkDataPreview] = useState<any[]>([])
    const [dragActive, setDragActive] = useState(false)
    
    // Toast Notification State
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

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
    const [formData, setFormData] = useState({ name: "", batch: new Date().getFullYear(), phone: "", birthDate: "" })

    const batches = ["All", ...Array.from(new Set(students.map(s => s.batch))).sort()]

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm)
        const matchesBatch = selectedBatch === "All" || s.batch.toString() === selectedBatch
        return matchesSearch && matchesBatch
    })

    // Open Modal for Create
    const openAddModal = () => {
        setEditingId(null)
        setFormData({ name: "", batch: new Date().getFullYear(), phone: "", birthDate: "" })
        setIsModalOpen(true)
    }

    // Open Modal for Edit
    const openEditModal = (student: any) => {
        setEditingId(student.id)
        const formatDOB = student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : ""
        setFormData({ name: student.name, batch: student.batch, phone: student.phone, birthDate: formatDOB })
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

    const processCSV = async (file: File) => {
        const text = await file.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l)
        const dataRows = lines.slice(1).map(line => {
            const values = line.split(',')
            return {
                name: values[0]?.trim() || "Unknown",
                batch: Number(values[1]?.trim()) || new Date().getFullYear(),
                phone: values[2]?.trim() || "",
                birthDate: values[3]?.trim() || "2000-01-01"
            }
        }).filter(row => row.name !== "Unknown")
        setBulkDataPreview(dataRows)
    }

    const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processCSV(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset
        }
    }

    const handleDownloadTemplate = () => {
        const content = "name,batch,phone,birthDate\nJohn Doe,2024,08123456789,2006-11-25\n";
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "template_student.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processCSV(e.dataTransfer.files[0]);
        }
    };

    const handleConfirmBulkUpload = async () => {
        if (bulkDataPreview.length === 0) return;
        setUploading(true);
        const result = await bulkCreateStudents(bulkDataPreview);
        setUploading(false);
        
        if (result.success) {
            showToast(`Successfully uploaded ${bulkDataPreview.length} students!`, 'success');
            loadStudents();
            setIsBulkUploadModalOpen(false);
            setBulkDataPreview([]);
        } else {
            showToast(result.error || "Failed to upload students", 'error');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold">Student Directory</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsBulkUploadModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 transition-colors"
                    >
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Birth Date (YYYY-MM-DD)</label>
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name || !formData.phone || !formData.birthDate}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editingId ? "Update Student" : "Save Student"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {isBulkUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 shadow-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Bulk Upload Students
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a CSV file to add multiple students at once.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsBulkUploadModalOpen(false);
                                    setBulkDataPreview([]);
                                }} 
                                disabled={uploading}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4" /> Format Instructions
                            </h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400/80 mb-3">
                                Upload a standard CSV file with headers: <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-mono text-xs">name, batch, phone, birthDate</code>. Format of birthDate is YYYY-MM-DD.
                            </p>
                            <button 
                                onClick={handleDownloadTemplate}
                                className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50 transition-all shadow-sm"
                            >
                                <DownloadCloud className="h-4 w-4 mr-2" /> Download Template
                            </button>
                        </div>

                        {!bulkDataPreview.length ? (
                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer ${
                                    dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUploadChange}
                                />
                                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500 dark:text-slate-400">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Click to upload or drag and drop</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">CSV file up to 5MB</p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center animate-in fade-in slide-in-from-bottom-2">
                                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Ready to upload</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Found <strong className="text-slate-900 dark:text-white">{bulkDataPreview.length}</strong> valid student records.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button 
                                        onClick={() => setBulkDataPreview([])}
                                        disabled={uploading}
                                        className="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleConfirmBulkUpload}
                                        disabled={uploading}
                                        className="flex items-center px-4 py-2 font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 transition-all shadow-sm"
                                    >
                                        {uploading ? (
                                            <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Processing...</>
                                        ) : (
                                            <><Upload className="h-4 w-4 mr-2" /> Upload Data</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                        toast.type === 'success' 
                            ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400' 
                            : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <p className="font-medium text-sm">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
