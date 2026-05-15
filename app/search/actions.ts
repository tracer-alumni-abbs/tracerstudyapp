'use server'

import prisma from "@/lib/prisma"

export async function getStudentsByBatch(batch: number) {
    try {
        const students = await prisma.student.findMany({
            where: {
                batch: batch
            },
            select: {
                id: true,
                name: true,
                batch: true
            },
            orderBy: {
                name: 'asc'
            }
        })
        return { success: true, data: students }
    } catch (error) {
        console.error("Failed to fetch students:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

export async function getBatches() {
    try {
        const batchesResult = await prisma.student.findMany({
            select: {
                batch: true,
            },
            distinct: ['batch'],
            orderBy: {
                batch: 'asc'
            }
        })
        const batches = batchesResult.map(b => b.batch).filter(b => b !== null && b !== undefined)
        return { success: true, data: batches }
    } catch (error) {
        console.error("Failed to fetch batches:", error)
        return { success: false, error: "Failed to fetch batches" }
    }
}
