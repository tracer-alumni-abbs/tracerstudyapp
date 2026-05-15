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

        const univNames = Array.from(univMap.keys())
        
        // Find existing univs
        const existingUnivs = await prisma.university.findMany({
            where: { name: { in: univNames } },
            select: { id: true, name: true }
        })
        const existingUnivNames = new Set(existingUnivs.map(u => u.name))

        // Create missing univs
        const missingUnivNames = univNames.filter(name => !existingUnivNames.has(name))
        let importedUnivs = 0
        if (missingUnivNames.length > 0) {
            await prisma.university.createMany({
                data: missingUnivNames.map(name => ({ name })),
                skipDuplicates: true
            })
            importedUnivs = missingUnivNames.length
        }

        // Fetch all univs again to get their IDs
        const allUnivs = await prisma.university.findMany({
            where: { name: { in: univNames } },
            select: { id: true, name: true }
        })
        const univIdMap = new Map(allUnivs.map(u => [u.name, u.id]))

        // Build program data
        const programDataToInsert: any[] = []
        for (const [univName, programs] of Array.from(univMap.entries())) {
            const uid = univIdMap.get(univName)
            if (!uid) continue
            
            // remove duplicate programs within the same university in the CSV
            const uniqueProgs = new Map<string, any>()
            for(const p of programs) {
                uniqueProgs.set(p.name, p)
            }

            for (const prog of Array.from(uniqueProgs.values())) {
                programDataToInsert.push({
                    universityId: uid,
                    name: prog.name,
                    level: prog.level || null
                })
            }
        }

        let importedProdis = 0
        if (programDataToInsert.length > 0) {
            // Prisma createMany skipDuplicates
            const result = await prisma.programStudy.createMany({
                data: programDataToInsert,
                skipDuplicates: true
            })
            importedProdis = result.count
        }
        
        revalidatePath('/admin/options')
        return { success: true, importedUnivs, importedProdis }
    } catch (error) {
        console.error("Bulk import error:", error)
        return { success: false, error: "Failed to bulk import data" }
    }
}
