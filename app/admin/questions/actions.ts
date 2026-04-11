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
                text: q.question,
                type: q.type,
                options: q.options ? JSON.parse(q.options) : [],
                order: q.order
            }))
        }
    } catch (error: any) {
        console.error("Error fetching questions:", error)
        return { success: false, message: "Failed to fetch questions" }
    }
}

export async function saveQuestion(data: { id: string, text: string, type: string, options: string[], order?: number }) {
    try {
        await prisma.surveyQuestion.upsert({
            where: { id: data.id },
            update: {
                question: data.text,
                type: data.type,
                options: data.type === 'Multiple Choice' ? JSON.stringify(data.options) : null,
            },
            create: {
                id: data.id, 
                question: data.text,
                type: data.type,
                options: data.type === 'Multiple Choice' ? JSON.stringify(data.options) : null,
                order: data.order ?? 0
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
