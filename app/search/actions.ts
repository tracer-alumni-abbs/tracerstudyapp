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
