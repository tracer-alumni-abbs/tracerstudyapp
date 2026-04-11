'use server'

import prisma from '@/lib/prisma'

export async function getStudent(studentId: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })
        if (!student) return { success: false, message: "Student not found" }
        return { success: true, data: student }
    } catch (error) {
        return { success: false, message: "Failed to fetch student data" }
    }
}


export async function verifyIdentity(studentId: string, birthDateString: string) {
    try {
        // FALLBACK FOR MOCK DATA / DEMO (Remove in production)
        // If ID is one of the mock IDs used in search page
        // FALLBACK FOR MOCK DATA / DEMO (Remove in production)
        // If ID is one of the mock IDs used in search page
        if (["1", "2", "3", "4", "temp"].includes(studentId) || studentId.startsWith("temp")) {
            // Assume correct date is 2000-01-01 for demo
            // Robust comparison: Check against YYYY-MM-DD string
            if (birthDateString === "2000-01-01") {
                return { success: true }
            } else {
                return { success: false, message: 'Incorrect birth date. (Hint: Try 01/01/2000 for demo)' }
            }
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
        })

        if (!student) {
            return { success: false, message: 'Student not found' }
        }

        if (!student.birthDate) {
            return { success: false, message: 'Identity verification data not found for this student.' }
        }

        // Compare dates using ISO string part (YYYY-MM-DD)
        // Ensure we compare the date part only
        const inputDateString = birthDateString // already YYYY-MM-DD
        const storedDateString = student.birthDate.toISOString().split('T')[0]

        if (inputDateString === storedDateString) {
            return { success: true }
        } else {
            return { success: false, message: 'Incorrect birth date.' }
        }
    } catch (error) {
        console.error('Verification error:', error)
        return { success: false, message: 'An error occurred during verification.' }
    }
}
