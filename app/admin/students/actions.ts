'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getStudents() {
    try {
        const students = await prisma.student.findMany({
            include: {
                responses: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: students }
    } catch (error) {
        console.error("Failed to fetch students:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

export async function createStudent(data: any) {
    try {
        const student = await prisma.student.create({
            data: {
                name: data.name,
                batch: data.batch,
                phone: data.phone,
                // Default birthDate for now
                birthDate: new Date("2000-01-01")
            }
        })
        revalidatePath('/admin/students')
        return { success: true, data: student }
    } catch (error) {
        console.error("Failed to create student:", error)
        return { success: false, error: "Failed to create student" }
    }
}

export async function updateStudent(id: string, data: any) {
    try {
        const student = await prisma.student.update({
            where: { id },
            data: {
                name: data.name,
                batch: data.batch,
                phone: data.phone
            }
        })
        revalidatePath('/admin/students')
        return { success: true, data: student }
    } catch (error) {
        console.error("Failed to update student:", error)
        return { success: false, error: "Failed to update student" }
    }
}

export async function deleteStudent(id: string) {
    try {
        await prisma.student.delete({
            where: { id }
        })
        revalidatePath('/admin/students')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete student:", error)
        return { success: false, error: "Failed to delete student" }
    }
}
