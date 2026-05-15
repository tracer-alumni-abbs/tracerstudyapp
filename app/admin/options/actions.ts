"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUniversities() {
    try {
        const data = await prisma.university.findMany({
            include: { programs: { orderBy: { name: 'asc' } } },
            orderBy: { name: 'asc' }
        })
        return { success: true, data }
    } catch (error) {
        return { success: false, data: [] }
    }
}

export async function createUniversity(name: string) {
    if (!name.trim()) return { success: false, error: "Name cannot be empty" }
    try {
        const created = await prisma.university.create({
            data: { name: name.trim() }
        })
        revalidatePath('/admin/options')
        return { success: true, data: created }
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "This university already exists" }
        return { success: false, error: "Failed to create university" }
    }
}

export async function deleteUniversity(id: string) {
    try {
        await prisma.university.delete({ where: { id } })
        revalidatePath('/admin/options')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete university" }
    }
}

export async function updateUniversity(id: string, name: string) {
    try {
        await prisma.university.update({ where: { id }, data: { name: name.trim() } })
        revalidatePath('/admin/options')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update university" }
    }
}

export async function createProgram(universityId: string, name: string, level?: string) {
    if (!name.trim()) return { success: false, error: "Name cannot be empty" }
    try {
        const created = await prisma.programStudy.create({
            data: { universityId, name: name.trim(), level: level?.trim() || null }
        })
        revalidatePath('/admin/options')
        return { success: true, data: created }
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "This program already exists at this university" }
        return { success: false, error: "Failed to create program" }
    }
}

export async function deleteProgram(id: string) {
    try {
        await prisma.programStudy.delete({ where: { id } })
        revalidatePath('/admin/options')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete program" }
    }
}

export async function updateProgram(id: string, name: string, level?: string) {
    try {
        await prisma.programStudy.update({ where: { id }, data: { name: name.trim(), level: level?.trim() || null } })
        revalidatePath('/admin/options')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update program" }
    }
}

export async function bulkImportData(rows: {univ: string, prodi: string, jenjang: string}[]) {
    try {
        const univMap = new Map<string, {name: string, level: string}[]>()
        for (const row of rows) {
            const univ = row.univ.trim()
            const prodi = row.prodi.trim()
            if (!univ) continue
            if (!univMap.has(univ)) univMap.set(univ, [])
            if (prodi) univMap.get(univ)!.push({name: prodi, level: row.jenjang?.trim() || ''})
        }

        let importedUnivs = 0
        let importedProdis = 0

        for (const [univName, programs] of Array.from(univMap.entries())) {
            let university = await prisma.university.findUnique({ where: { name: univName } })
            if (!university) {
                university = await prisma.university.create({ data: { name: univName } })
                importedUnivs++
            }

            for (const prog of programs) {
                try {
                    await prisma.programStudy.create({
                        data: {
                            universityId: university.id,
                            name: prog.name,
                            level: prog.level || null
                        }
                    })
                    importedProdis++
                } catch (e: any) {
                    // Ignore duplicate
                }
            }
        }
        
        revalidatePath('/admin/options')
        return { success: true, importedUnivs, importedProdis }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to bulk import data" }
    }
}
