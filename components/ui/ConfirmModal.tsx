"use client"
import { AlertCircle } from "lucide-react"

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmModal({ 
    isOpen, 
    title, 
    description, 
    confirmText = "Delete", 
    cancelText = "Cancel", 
    onConfirm, 
    onCancel 
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 relative space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                    {description}
                </p>
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
