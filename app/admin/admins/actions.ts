"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAdmins() {
    try {
        // @ts-ignore
        const admins = await prisma.admin.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: admins }
    } catch (error) {
        return { success: false, error: "Failed to fetch admins" }
    }
}

export async function createAdmin(data: { username: string; password?: string }) {
    try {
        if (!data.password) data.password = "admin123" // Default password
        // @ts-ignore
        await prisma.admin.create({
            data: { username: data.username, password: data.password }
        })
        revalidatePath("/admin/admins")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create admin. Username might already exist." }
    }
}

export async function deleteAdmin(id: string) {
    try {
        // @ts-ignore
        await prisma.admin.delete({ where: { id } })
        revalidatePath("/admin/admins")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete admin" }
    }
}
