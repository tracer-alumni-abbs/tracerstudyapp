"use client"

import { useState, useEffect } from "react"
import { Plus, GripVertical, Trash2, Edit2, X, Save, Check, MinusCircle, Loader2 } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { getQuestions, saveQuestion, deleteQuestionItem, updateOrder } from "./actions"

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempData, setTempData] = useState<{ text: string, type: string, options: string[] } | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    useEffect(() => {
        loadQuestions()
    }, [])

    const loadQuestions = async () => {
        setLoading(true)
        const res = await getQuestions()
        if (res.success && res.data) {
            setQuestions(res.data)
        }
        setLoading(false)
    }

    const deleteQuestion = (id: string) => {
        setItemToDelete(id)
    }

    const confirmDelete = async () => {
        if (itemToDelete) {
            const id = itemToDelete;
            // Optimistic state
            setQuestions(prev => prev.filter(q => q.id !== id))
            setItemToDelete(null)
            
            // Fire and forget
            deleteQuestionItem(id).catch(() => loadQuestions())
        }
    }

    const startEdit = (question: any) => {
        setEditingId(question.id)
        setTempData({ text: question.text, type: question.type, options: question.options || [] })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setTempData(null)
    }

    const saveEdit = async () => {
        if (editingId && tempData) {
            const currentItemIndex = questions.findIndex(q => q.id === editingId)
            const order = currentItemIndex >= 0 ? currentItemIndex : questions.length
            const payload = { id: editingId, ...tempData, order }
            
            // Optimistic update
            setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, ...tempData } : q))
            setEditingId(null)
            setTempData(null)
            
            // Background sync
            saveQuestion(payload).catch(() => loadQuestions())
        }
    }

    const addNew = () => {
        const newId = Date.now().toString()
        const newQuestion = { id: newId, text: "New Question", type: "Text", options: [] }
        setQuestions([...questions, newQuestion])
        startEdit(newQuestion)
    }

    const addOption = () => {
        if (tempData) {
            setTempData({ ...tempData, options: [...tempData.options, `Option ${tempData.options.length + 1}`] })
        }
    }

    const removeOption = (index: number) => {
        if (tempData) {
            const newOptions = [...tempData.options]
            newOptions.splice(index, 1)
            setTempData({ ...tempData, options: newOptions })
        }
    }

    const updateOption = (index: number, value: string) => {
        if (tempData) {
            const newOptions = [...tempData.options]
            newOptions[index] = value
            setTempData({ ...tempData, options: newOptions })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Survey Questions</h1>
                    <p className="text-slate-500">Manage the questions asked in the tracer study.</p>
                </div>
                <button
                    onClick={addNew}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
                            <p>Loading questions...</p>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No questions found. Add one above!</div>
                    ) : (
                        questions.map((question, index) => (
                            <div key={question.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 group relative">
                            <div className="cursor-move text-slate-400 hover:text-slate-600 mt-2">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            <div className="flex-1 space-y-2">
                                {editingId === question.id ? (
                                    <div className="grid gap-4 md:grid-cols-3 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="md:col-span-2 space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Question Text</label>
                                                <input
                                                    value={tempData?.text || ""}
                                                    onChange={(e) => setTempData({ ...tempData!, text: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                                                />
                                            </div>

                                            {tempData?.type === "Multiple Choice" && (
                                                <div className="space-y-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase">Answer Options</label>
                                                    {tempData.options.map((opt, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <input
                                                                value={opt}
                                                                onChange={(e) => updateOption(idx, e.target.value)}
                                                                className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-700 dark:border-slate-600"
                                                            />
                                                            <button
                                                                onClick={() => removeOption(idx)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500"
                                                            >
                                                                <MinusCircle className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={addOption}
                                                        className="text-xs font-medium text-blue-600 hover:underline flex items-center"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Option
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Answer Type</label>
                                            <select
                                                value={tempData?.type || ""}
                                                onChange={(e) => setTempData({ ...tempData!, type: e.target.value, options: e.target.value === "Multiple Choice" ? ["Option 1", "Option 2"] : [] })}
                                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                                            >
                                                <option>Text</option>
                                                <option>Multiple Choice</option>
                                                <option>Rating</option>
                                                <option>Text Area</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-medium text-lg">{question.text}</span>
                                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                                                {question.type}
                                            </span>
                                        </div>
                                        {question.type === "Multiple Choice" && question.options && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {question.options.map((opt: string, i: number) => (
                                                    <span key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                                                        {opt}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {editingId === question.id ? (
                                    <>
                                        <button
                                            onClick={saveEdit}
                                            className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg dark:bg-green-900/30 dark:text-green-400"
                                            title="Save"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg dark:bg-slate-700 dark:text-slate-400"
                                            title="Cancel"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(question)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-slate-800"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteQuestion(question.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-slate-800"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmModal 
                isOpen={!!itemToDelete}
                title="Delete Question"
                description="Are you sure you want to delete this survey question? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    )
}
