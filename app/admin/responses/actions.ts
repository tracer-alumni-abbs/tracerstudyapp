"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSurveyResponses() {
    try {
        const students = await prisma.student.findMany({
            where: {
                responses: { some: {} }
            },
            include: {
                jobHistory: { where: { isCurrent: true } },
                responses: { include: { question: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = students.map(s => {
            const currentJob = s.jobHistory[0]
            
            // Use surveyStatus stored on student profile (set on form submission)
            const status = s.surveyStatus || "Unknown"

            const answers = s.responses.map(r => ({
                questionEn: r.question.questionEn,
                questionId: r.question.questionId,
                answer: r.answer,
                order: r.question.order
            })).sort((a, b) => a.order - b.order)

            const submitDate = s.responses.length > 0 
                ? new Date(Math.max(...s.responses.map(r => r.createdAt.getTime()))).toISOString().split('T')[0]
                : s.updatedAt.toISOString().split('T')[0]

            return {
                id: s.id,
                name: s.name,
                batch: s.batch,
                date: submitDate,
                status: status,
                university: s.surveyUniversity || null,
                major: s.surveyMajor || null,
                jalurMasuk: s.surveyJalurMasuk || null,
                aktivitas: s.surveyAktivitas || null,
                company: currentJob?.company || "-",
                position: currentJob?.position || "-",
                salary: "-",
                answers: answers
            }
        })
        return { success: true, data: formatted }
    } catch (error) {
        console.error("Failed to fetch responses", error)
        return { success: false, data: [] }
    }
}

export async function deleteResponseItem(studentId: string) {
    try {
        await prisma.surveyResponse.deleteMany({ where: { studentId } })
        revalidatePath("/admin/responses")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete response" }
    }
}
