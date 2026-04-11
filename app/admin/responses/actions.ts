"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSurveyResponses() {
    try {
        const responses = await prisma.surveyResponse.findMany({
            include: {
                student: { include: { jobHistory: { where: { isCurrent: true } } } },
                question: true
            },
            orderBy: { createdAt: 'desc' }
        })

        // Map to UI friendly format
        const formatted = responses.map(r => {
            const currentJob = r.student.jobHistory[0]
            const isEmployed = !!currentJob
            let status = "Unemployed"
            if (isEmployed) {
                const pos = currentJob.position.toLowerCase()
                const comp = currentJob.company.toLowerCase()
                if (pos.includes("student") || pos.includes("mahasiswa") || comp.includes("university") || comp.includes("universitas")) {
                    status = "Continuing Study"
                } else if (pos.includes("freelance") || pos.includes("founder") || comp.includes("self") || comp.includes("wiraswasta")) {
                    status = "Self-Employed"
                } else {
                    status = "Employed"
                }
            }

            return {
                id: r.id,
                name: r.student.name,
                batch: r.student.batch,
                date: r.createdAt.toISOString().split('T')[0],
                status: status,
                company: currentJob?.company || "-",
                position: currentJob?.position || "-",
                question: r.question.question,
                answer: r.answer,
                salary: "-", // Not tracked currently
                relevant: Math.floor(Math.random() * 3) + 3 // mock relevance logic
            }
        })
        return { success: true, data: formatted }
    } catch (error) {
        return { success: false, data: [] }
    }
}

export async function deleteResponseItem(id: string) {
    try {
        await prisma.surveyResponse.delete({ where: { id } })
        revalidatePath("/admin/responses")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete response" }
    }
}
