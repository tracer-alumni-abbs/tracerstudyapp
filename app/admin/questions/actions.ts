"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getQuestions() {
    try {
        const data = await prisma.surveyQuestion.findMany({
            orderBy: { order: 'asc' }
        });
        
        return { 
            success: true, 
            data: data.map(q => ({
                id: q.id,
                questionEn: q.questionEn,
                questionId: q.questionId,
                type: q.type,
                optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : [],
                optionsId: q.optionsId ? JSON.parse(q.optionsId) : [],
                order: q.order,
                isStandard: q.isStandard,
                standardKey: q.standardKey
            }))
        }
    } catch (error: any) {
        console.error("Error fetching questions:", error)
        return { success: false, message: "Failed to fetch questions" }
    }
}

export async function saveQuestion(data: { id: string, questionEn: string, questionId: string, type: string, optionsEn: string[], optionsId: string[], order?: number, isStandard?: boolean, standardKey?: string }) {
    try {
        await prisma.surveyQuestion.upsert({
            where: { id: data.id },
            update: {
                questionEn: data.questionEn,
                questionId: data.questionId,
                type: data.type,
                optionsEn: data.type === 'Multiple Choice' ? JSON.stringify(data.optionsEn) : null,
                optionsId: data.type === 'Multiple Choice' ? JSON.stringify(data.optionsId) : null,
            },
            create: {
                id: data.id, 
                questionEn: data.questionEn,
                questionId: data.questionId,
                type: data.type,
                optionsEn: data.type === 'Multiple Choice' ? JSON.stringify(data.optionsEn) : null,
                optionsId: data.type === 'Multiple Choice' ? JSON.stringify(data.optionsId) : null,
                order: data.order ?? 0,
                isStandard: data.isStandard || false,
                standardKey: data.standardKey || null
            }
        });
        
        revalidatePath('/admin/questions')
        return { success: true }
    } catch (error: any) {
        console.error("Error saving question:", error)
        return { success: false, message: "Failed to save question" }
    }
}

export async function deleteQuestionItem(id: string) {
    try {
        const q = await prisma.surveyQuestion.findUnique({ where: { id } })
        if (q && q.isStandard) return { success: false, message: "Cannot delete a standard question" }

        await prisma.surveyQuestion.delete({ where: { id } })
        revalidatePath('/admin/questions')
        return { success: true }
    } catch (error: any) {
        return { success: false }
    }
}

export async function updateOrder(orderedItems: { id: string, order: number }[]) {
     try {
         await prisma.$transaction(
             orderedItems.map(q => prisma.surveyQuestion.update({
                 where: { id: q.id },
                 data: { order: q.order }
             }))
         )
         revalidatePath('/admin/questions')
         return { success: true }
     } catch (e) {
         return { success: false }
     }
}

export async function seedStandardQuestions() {
    try {
        const standardQuestions = [
            {
                standardKey: 'current_status',
                questionEn: 'What is your current situation?',
                questionId: 'Status Saat Ini',
                type: 'Multiple Choice',
                optionsEn: ['Working / Employed', 'Entrepreneur / Freelance', 'Continuing Study', 'Not Working Yet'],
                optionsId: ['Bekerja / Karyawan', 'Wirausaha / Freelance', 'Lanjut Studi', 'Belum Bekerja'],
                order: -100 // keep standard questions at the top
            }
        ]

        for (const sq of standardQuestions) {
            const existing = await prisma.surveyQuestion.findUnique({ where: { standardKey: sq.standardKey } })
            if (!existing) {
                await prisma.surveyQuestion.create({
                    data: {
                        questionEn: sq.questionEn,
                        questionId: sq.questionId,
                        type: sq.type,
                        optionsEn: JSON.stringify(sq.optionsEn),
                        optionsId: JSON.stringify(sq.optionsId),
                        order: sq.order,
                        isStandard: true,
                        standardKey: sq.standardKey
                    }
                })
            }
        }
        revalidatePath('/admin/questions')
        return { success: true }
    } catch (error) {
        console.error("Failed to seed standard questions", error)
        return { success: false }
    }
}
