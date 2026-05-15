"use client"

import { useState, useEffect } from "react"
import { Plus, GripVertical, Trash2, Edit2, X, Save, Check, MinusCircle, Loader2, Globe, Lock } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { getQuestions, saveQuestion, deleteQuestionItem, updateOrder, seedStandardQuestions } from "./actions"

export default function QuestionsClient({ initialData }: { initialData: any[] }) {
    const [questions, setQuestions] = useState<any[]>(initialData)
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    
    type TempData = { 
        questionEn: string, questionId: string, 
        type: string, 
        optionsEn: string[], optionsId: string[],
        isStandard: boolean, standardKey: string | null
    }
    const [tempData, setTempData] = useState<TempData | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    useEffect(() => {
        if (!initialData.some(q => q.isStandard)) {
            seedStandardQuestions().then(() => loadQuestions(false))
        }
    }, [initialData])

    const loadQuestions = async (showLoading = true) => {
        if (showLoading) setLoading(true)
        const res = await getQuestions()
        if (res.success && res.data) setQuestions(res.data)
        if (showLoading) setLoading(false)
    }

    const deleteQuestion = (id: string, isStandard: boolean) => {
        if (isStandard) return
        setItemToDelete(id)
    }

    const confirmDelete = async () => {
        if (itemToDelete) {
            const id = itemToDelete;
            setQuestions(prev => prev.filter(q => q.id !== id))
            setItemToDelete(null)
            deleteQuestionItem(id).catch(() => loadQuestions(false))
        }
    }

    const startEdit = (question: any) => {
        setEditingId(question.id)
        setTempData({ 
            questionEn: question.questionEn || "", 
            questionId: question.questionId || "", 
            type: question.type, 
            optionsEn: question.optionsEn || [], 
            optionsId: question.optionsId || [],
            isStandard: question.isStandard || false,
            standardKey: question.standardKey || null
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setTempData(null)
    }

    const saveEdit = async () => {
        if (editingId && tempData) {
            const currentItemIndex = questions.findIndex(q => q.id === editingId)
            const order = currentItemIndex >= 0 ? questions[currentItemIndex].order : questions.length
            const payload = { 
                id: editingId, 
                ...tempData, 
                order,
                standardKey: tempData.standardKey === null ? undefined : tempData.standardKey
            }
            
            setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, ...tempData } : q))
            setEditingId(null)
            setTempData(null)
            
            saveQuestion(payload).catch(() => loadQuestions(false))
        }
    }

    const addNew = () => {
        const newId = Date.now().toString()
        const newQuestion = { 
            id: newId, questionEn: "New Question", questionId: "Pertanyaan Baru", 
            type: "Text", optionsEn: [], optionsId: [], isStandard: false, standardKey: null, order: questions.length 
        }
        setQuestions([...questions, newQuestion])
        startEdit(newQuestion)
    }

    const addOption = () => {
        if (tempData) {
            setTempData({ 
                ...tempData, 
                optionsEn: [...tempData.optionsEn, `Option ${tempData.optionsEn.length + 1}`],
                optionsId: [...tempData.optionsId, `Opsi ${tempData.optionsId.length + 1}`]
            })
        }
    }

    const removeOption = (index: number) => {
        if (tempData) {
            const newEn = [...tempData.optionsEn]
            const newId = [...tempData.optionsId]
            newEn.splice(index, 1)
            newId.splice(index, 1)
            setTempData({ ...tempData, optionsEn: newEn, optionsId: newId })
        }
    }

    const updateOption = (lang: 'en' | 'id', index: number, value: string) => {
        if (tempData) {
            if (lang === 'en') {
                const newEn = [...tempData.optionsEn]
                newEn[index] = value
                setTempData({ ...tempData, optionsEn: newEn })
            } else {
                const newId = [...tempData.optionsId]
                newId[index] = value
                setTempData({ ...tempData, optionsId: newId })
            }
        }
    }

    const sortedQuestions = [...questions].sort((a, b) => {
        if (a.isStandard && !b.isStandard) return -1
        if (!a.isStandard && b.isStandard) return 1
        return a.order - b.order
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Survey Questions</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage standard and custom questions in both Indonesian and English.</p>
                </div>
                <button
                    onClick={addNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" /> Add Custom Question
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
                            <p>Loading questions...</p>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No questions found. Add one above!</div>
                    ) : (
                        sortedQuestions.map((question, index) => (
                            <div key={question.id} className={`flex items-start gap-4 p-4 rounded-xl border group relative ${question.isStandard ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'}`}>
                                {!question.isStandard && (
                                    <div className="cursor-move text-slate-400 hover:text-slate-600 mt-2">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                )}
                                {question.isStandard && (
                                    <div className="mt-2 text-blue-400" title="Standard Question (Locked)">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                )}

                                <div className="flex-1 space-y-2">
                                    {editingId === question.id ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Globe className="h-3 w-3" /> Question (English)</label>
                                                    <input
                                                        value={tempData?.questionEn || ""}
                                                        onChange={(e) => setTempData({ ...tempData!, questionEn: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-800 dark:border-slate-700"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Globe className="h-3 w-3" /> Pertanyaan (Indonesian)</label>
                                                    <input
                                                        value={tempData?.questionId || ""}
                                                        onChange={(e) => setTempData({ ...tempData!, questionId: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-800 dark:border-slate-700"
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-w-xs">
                                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Answer Type</label>
                                                <select
                                                    value={tempData?.type || ""}
                                                    disabled={question.isStandard}
                                                    onChange={(e) => setTempData({ ...tempData!, type: e.target.value, optionsEn: e.target.value === "Multiple Choice" ? ["Opt 1", "Opt 2"] : [], optionsId: e.target.value === "Multiple Choice" ? ["Opsi 1", "Opsi 2"] : [] })}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-slate-800 dark:border-slate-700 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                                >
                                                    <option>Text</option>
                                                    <option>Multiple Choice</option>
                                                    <option>Rating</option>
                                                    <option>Text Area</option>
                                                </select>
                                            </div>

                                            {tempData?.type === "Multiple Choice" && (
                                                <div className="space-y-3 p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase">Answer Options</label>
                                                    {tempData.optionsEn.map((optEn, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <input
                                                                value={optEn}
                                                                onChange={(e) => updateOption('en', idx, e.target.value)}
                                                                placeholder="English option"
                                                                className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 outline-none text-sm dark:bg-slate-800 dark:border-slate-600"
                                                            />
                                                            <input
                                                                value={tempData.optionsId[idx] || ""}
                                                                onChange={(e) => updateOption('id', idx, e.target.value)}
                                                                placeholder="Indonesian option"
                                                                className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 outline-none text-sm dark:bg-slate-800 dark:border-slate-600"
                                                            />
                                                            <button onClick={() => removeOption(idx)} disabled={question.isStandard} className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30">
                                                                <MinusCircle className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {!question.isStandard && (
                                                        <button onClick={addOption} className="text-xs font-medium text-blue-600 hover:underline flex items-center">
                                                            <Plus className="h-3 w-3 mr-1" /> Add Option
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{question.questionEn || "Unnamed"}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                                                        {question.type}
                                                    </span>
                                                    {question.isStandard && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold dark:bg-slate-800 dark:text-slate-400">
                                                            Front-Page Standard
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">{question.questionId}</span>
                                            </div>

                                            {question.type === "Multiple Choice" && question.optionsEn && (
                                                <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                    {question.optionsEn.map((optEn: string, i: number) => (
                                                        <div key={i} className="flex gap-4 text-xs">
                                                            <span className="w-1/2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0"/> {optEn}
                                                            </span>
                                                            <span className="w-1/2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"/> {question.optionsId[i]}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {editingId === question.id ? (
                                        <>
                                            <button onClick={saveEdit} className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg dark:bg-green-900/30 dark:text-green-400 active:scale-90" title="Save">
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button onClick={cancelEdit} className="p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg dark:bg-slate-800 dark:text-slate-400 active:scale-90" title="Cancel">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(question)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-slate-800 active:scale-90" title="Edit">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            {!question.isStandard && (
                                                <button onClick={() => deleteQuestion(question.id, question.isStandard)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-slate-800 active:scale-90" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
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
                description="Are you sure you want to delete this custom survey question? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    )
}
