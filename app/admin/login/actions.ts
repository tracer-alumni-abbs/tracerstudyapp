"use server"

import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

export async function loginAdminAction(username: string, passwordHash: string) {
    try {
        // Find admin in DB
        // @ts-ignore
        const admin = await prisma.admin.findUnique({ where: { username } })
        
        // Very basic password checking as per current schema, consider bcrypt for production
        if (admin && admin.password === passwordHash) {
            // Set cookie
            const cookieStore = await cookies()
            cookieStore.set("admin_session", "true", { 
                maxAge: 60 * 60 * 24, // 1 day
                httpOnly: false, // For JS access compatibility in layout
                secure: process.env.NODE_ENV === "production"
            })
            return { success: true }
        }
        
        // If no admins exist at all, allow default admin/admin fallback to prevent lockout during setup
        // @ts-ignore
        const count = await prisma.admin.count()
        if (count === 0 && username === "admin" && passwordHash === "admin") {
            // Self-seed the first admin seamlessly
            // @ts-ignore
            await prisma.admin.create({ data: { username: "admin", password: "admin" } })
            
            const cookieStore = await cookies()
            cookieStore.set("admin_session", "true", { 
                maxAge: 60 * 60 * 24,
                httpOnly: false
            })
            return { success: true }
        }

        return { success: false, error: "Invalid username or password" }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Authentication failed. Please try again." }
    }
}
