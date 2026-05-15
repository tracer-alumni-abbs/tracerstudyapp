"use client"

import { useState, useRef } from "react"
import {
    Plus, Trash2, Edit2, Check, X, GraduationCap,
    Search, AlertCircle, CheckCircle2, FileUp, Loader2,
    ChevronDown, ChevronRight, Building
} from "lucide-react"
import { 
    createUniversity, deleteUniversity, updateUniversity, 
    createProgram, deleteProgram, updateProgram, 
    bulkImportData, getUniversities 
} from "./actions"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

type Program = { id: string; name: string; level: string | null; universityId: string }
type University = { id: string; name: string; programs: Program[] }

export default function OptionsClient({ initialUniversities }: { initialUniversities: University[] }) {
    const [universities, setUniversities] = useState<University[]>(initialUniversities)
    const [search, setSearch] = useState("")
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    
    // Toast
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null)
    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    // CSV Upload
    const [uploadingCSV, setUploadingCSV] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Add/Edit State
    const [addingUniv, setAddingUniv] = useState(false)
    const [newUnivName, setNewUnivName] = useState("")
    
    const [editingUnivId, setEditingUnivId] = useState<string | null>(null)
    const [editUnivName, setEditUnivName] = useState("")
    
    const [addingProgTo, setAddingProgTo] = useState<string | null>(null)
    const [newProgName, setNewProgName] = useState("")
    const [newProgLevel, setNewProgLevel] = useState("")
    
    const [editingProgId, setEditingProgId] = useState<string | null>(null)
    const [editProgName, setEditProgName] = useState("")
    const [editProgLevel, setEditProgLevel] = useState("")

    // Delete State
    const [deletingUniv, setDeletingUniv] = useState<string | null>(null)
    const [deletingProg, setDeletingProg] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        const next = new Set(expanded)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setExpanded(next)
    }

    const refresh = async () => {
        const res = await getUniversities()
        if (res.success && res.data) setUniversities(res.data)
    }

    const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingCSV(true)

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string
                const lines = text.split(/\r?\n/).filter(l => l.trim())
                if (lines.length < 2) {
                    showToast("File kosong atau format tidak valid", "error")
                    return
                }

                const parseLine = (line: string) => {
                    const row = []
                    let inQuotes = false
                    let curr = ''
                    for (let i = 0; i < line.length; i++) {
                        if (line[i] === '"') inQuotes = !inQuotes
                        else if ((line[i] === ',' || line[i] === ';') && !inQuotes) {
                            row.push(curr.trim())
                            curr = ''
                        } else curr += line[i]
                    }
                    row.push(curr.trim())
                    return row
                }

                const header = parseLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim())
                const univIdx = header.indexOf('univ')
                const prodiIdx = header.indexOf('prodi')
                const jenjangIdx = header.indexOf('jenjang')

                if (univIdx === -1 && prodiIdx === -1) {
                    showToast("Kolom 'univ' atau 'prodi' tidak ditemukan di baris pertama CSV", "error")
                    return
                }

                const rowsToImport = []
                for (let i = 1; i < lines.length; i++) {
                    const row = parseLine(lines[i])
                    rowsToImport.push({
                        univ: univIdx !== -1 && row[univIdx] ? row[univIdx].replace(/['"]/g, '') : '',
                        prodi: prodiIdx !== -1 && row[prodiIdx] ? row[prodiIdx].replace(/['"]/g, '') : '',
                        jenjang: jenjangIdx !== -1 && row[jenjangIdx] ? row[jenjangIdx].replace(/['"]/g, '') : ''
                    })
                }

                const res = await bulkImportData(rowsToImport)
                if (res.success) {
                    showToast(`Berhasil import ${res.importedUnivs} Univ dan ${res.importedProdis} Prodi baru`, "success")
                    await refresh()
                } else {
                    showToast(res.error || "Gagal import", "error")
                }
            } catch (error) {
                showToast("Gagal memproses file CSV", "error")
            } finally {
                setUploadingCSV(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsText(file)
    }

    const handleAddUniv = async () => {
        if (!newUnivName.trim()) return
        const res = await createUniversity(newUnivName)
        if (res.success) {
            showToast("Perguruan Tinggi ditambahkan", "success")
            setAddingUniv(false)
            setNewUnivName("")
            await refresh()
        } else {
            showToast(res.error || "Gagal", "error")
        }
    }

    const handleEditUniv = async (id: string) => {
        if (!editUnivName.trim()) return
        const res = await updateUniversity(id, editUnivName)
        if (res.success) {
            showToast("Disimpan", "success")
            setEditingUnivId(null)
            await refresh()
        } else {
            showToast(res.error || "Gagal", "error")
        }
    }

    const handleDeleteUniv = async () => {
        if (!deletingUniv) return
        const res = await deleteUniversity(deletingUniv)
        setDeletingUniv(null)
        if (res.success) {
            showToast("Dihapus", "success")
            await refresh()
        } else {
            showToast(res.error || "Gagal", "error")
        }
    }

    const handleAddProg = async (univId: string) => {
        if (!newProgName.trim()) return
        const res = await createProgram(univId, newProgName, newProgLevel)
        if (res.success) {
            showToast("Prodi ditambahkan", "success")
            setAddingProgTo(null)
            setNewProgName("")
            setNewProgLevel("")
            if (!expanded.has(univId)) toggleExpand(univId)
            await refresh()
        } else {
            showToast(res.error || "Gagal", "error")
        }
    }

    const handleEditProg = async (id: string) => {
        if (!editProgName.trim()) return
        const res = await updateProgram(id, editProgName, editProgLevel)
        if (res.success) {
            showToast("Disimpan", "success")
            setEditingProgId(null)
            await refresh()
        } else {
            showToast(res.error || "Gagal", "error")
        }
    }

    const handleDeleteProg = async () => {
        if (!deletingProg) return
        const res = await deleteProgram(deletingProg)
        setDeletingProg(null)
        if (res.success) {
            showToast("Dihapus", "success")
            await refresh()
        } else {
            showToast(res.error || "Gagal", "error")
        }
    }

    const filtered = universities.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.programs.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Data Referensi</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola daftar Perguruan Tinggi dan Program Studi yang terhubung.
                    </p>
                </div>
                <div>
                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleUploadCSV} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {uploadingCSV ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                        {uploadingCSV ? "Memproses CSV..." : "Upload Data CSV"}
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">Kolom: univ, prodi, jenjang</p>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-sm">
                <GraduationCap className="h-5 w-5 shrink-0 mt-0.5" />
                <p>
                    Data yang ditambahkan di sini akan otomatis terhubung. Saat alumni memilih Perguruan Tinggi, 
                    dropdown Program Studi hanya akan memunculkan prodi yang tersedia di kampus tersebut.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari Kampus atau Prodi..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setAddingUniv(true)}
                        className="ml-4 flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Tambah Kampus
                    </button>
                </div>

                {addingUniv && (
                    <div className="px-5 py-3 border-b border-blue-100 bg-blue-50/50 flex items-center gap-2 dark:border-blue-900/30 dark:bg-blue-900/10">
                        <Building className="h-4 w-4 text-blue-500" />
                        <input
                            autoFocus
                            value={newUnivName}
                            onChange={e => setNewUnivName(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter') handleAddUniv(); if(e.key === 'Escape') setAddingUniv(false) }}
                            placeholder="Nama Perguruan Tinggi..."
                            className="flex-1 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button onClick={handleAddUniv} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setAddingUniv(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md dark:hover:bg-slate-700"><X className="h-4 w-4" /></button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto max-h-[600px] p-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">Tidak ada data ditemukan</div>
                    ) : (
                        filtered.map(univ => (
                            <div key={univ.id} className="mb-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                {/* University Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/30 group">
                                    <div className="flex items-center gap-2 flex-1">
                                        <button onClick={() => toggleExpand(univ.id)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md">
                                            {expanded.has(univ.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>
                                        
                                        {editingUnivId === univ.id ? (
                                            <input
                                                autoFocus
                                                value={editUnivName}
                                                onChange={e => setEditUnivName(e.target.value)}
                                                onKeyDown={e => { if(e.key === 'Enter') handleEditUniv(univ.id); if(e.key === 'Escape') setEditingUnivId(null) }}
                                                className="flex-1 px-2 py-1 text-sm font-semibold rounded border border-blue-400 outline-none dark:bg-slate-900"
                                            />
                                        ) : (
                                            <span className="font-semibold text-sm cursor-pointer" onClick={() => toggleExpand(univ.id)}>
                                                {univ.name} <span className="text-slate-400 text-xs font-normal ml-1">({univ.programs.length} prodi)</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {editingUnivId === univ.id ? (
                                            <>
                                                <button onClick={() => handleEditUniv(univ.id)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-md"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => setEditingUnivId(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md"><X className="h-4 w-4" /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setAddingProgTo(univ.id); setNewProgName(""); setNewProgLevel(""); if(!expanded.has(univ.id)) toggleExpand(univ.id) }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md" title="Tambah Prodi"><Plus className="h-4 w-4" /></button>
                                                <button onClick={() => { setEditingUnivId(univ.id); setEditUnivName(univ.name) }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 className="h-4 w-4" /></button>
                                                <button onClick={() => setDeletingUniv(univ.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Programs List */}
                                {expanded.has(univ.id) && (
                                    <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        {addingProgTo === univ.id && (
                                            <div className="flex items-center gap-2 px-10 py-2 bg-slate-50 dark:bg-slate-800/50">
                                                <input
                                                    autoFocus
                                                    value={newProgName}
                                                    onChange={e => setNewProgName(e.target.value)}
                                                    placeholder="Nama Prodi..."
                                                    className="flex-1 px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 outline-none focus:border-blue-400"
                                                />
                                                <input
                                                    value={newProgLevel}
                                                    onChange={e => setNewProgLevel(e.target.value)}
                                                    placeholder="Jenjang (S1, D3)"
                                                    className="w-32 px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-800 outline-none focus:border-blue-400"
                                                    onKeyDown={e => { if(e.key === 'Enter') handleAddProg(univ.id); if(e.key === 'Escape') setAddingProgTo(null) }}
                                                />
                                                <button onClick={() => handleAddProg(univ.id)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => setAddingProgTo(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X className="h-4 w-4" /></button>
                                            </div>
                                        )}
                                        
                                        {univ.programs.map((prog, i) => (
                                            <div key={prog.id} className={`flex items-center justify-between px-10 py-2 group ${i < univ.programs.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}>
                                                {editingProgId === prog.id ? (
                                                    <div className="flex flex-1 gap-2 mr-2">
                                                        <input value={editProgName} onChange={e => setEditProgName(e.target.value)} className="flex-1 px-2 py-1 text-sm rounded border border-blue-400 outline-none dark:bg-slate-800" />
                                                        <input value={editProgLevel} onChange={e => setEditProgLevel(e.target.value)} placeholder="Jenjang" className="w-24 px-2 py-1 text-sm rounded border border-blue-400 outline-none dark:bg-slate-800" onKeyDown={e => { if(e.key === 'Enter') handleEditProg(prog.id) }} />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">{prog.name}</span>
                                                        {prog.level && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{prog.level}</span>}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {editingProgId === prog.id ? (
                                                        <>
                                                            <button onClick={() => handleEditProg(prog.id)} className="p-1 text-green-600 hover:bg-green-100 rounded-md"><Check className="h-3.5 w-3.5" /></button>
                                                            <button onClick={() => setEditingProgId(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md"><X className="h-3.5 w-3.5" /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => { setEditingProgId(prog.id); setEditProgName(prog.name); setEditProgLevel(prog.level || "") }} className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 className="h-3.5 w-3.5" /></button>
                                                            <button onClick={() => setDeletingProg(prog.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="h-3.5 w-3.5" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ConfirmModal isOpen={!!deletingUniv} title="Hapus Perguruan Tinggi" description="Semua Program Studi di dalamnya akan ikut terhapus. Yakin?" onConfirm={handleDeleteUniv} onCancel={() => setDeletingUniv(null)} />
            <ConfirmModal isOpen={!!deletingProg} title="Hapus Program Studi" description="Yakin ingin menghapus prodi ini?" onConfirm={handleDeleteProg} onCancel={() => setDeletingProg(null)} />

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-200">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-green-200 text-green-700 dark:text-green-400' : 'bg-white dark:bg-slate-900 border-red-200 text-red-700 dark:text-red-400'}`}>
                        {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        {toast.msg}
                    </div>
                </div>
            )}
        </div>
    )
}
