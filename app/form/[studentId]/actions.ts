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

export async function submitSurvey(studentId: string, profile: any, jobs: any[], responses: Record<string, any>) {
    try {
        // 1. Ensure the core questions exist so foreign keys don't fail
        await prisma.surveyQuestion.upsert({
            where: { id: "q1" },
            update: {},
            create: { id: "q1", question: "What is your current employment status?", type: "Multiple Choice", options: JSON.stringify(["Employed", "Self-employed", "Unemployed", "Student"]), order: 1 }
        })
        await prisma.surveyQuestion.upsert({
            where: { id: "q2" },
            update: {},
            create: { id: "q2", question: "How relevant was your study to your current job?", type: "Rating", order: 2 }
        })
        await prisma.surveyQuestion.upsert({
            where: { id: "q3" },
            update: {},
            create: { id: "q3", question: "Any suggestions for curriculum improvement?", type: "Text Area", order: 3 }
        })

        // 2. Update Student Profile
        await prisma.student.update({
            where: { id: studentId },
            data: { email: profile.email, phone: profile.phone }
        })

        // 3. Update Job History (Clear existing and recreate to handle deletions implicitly)
        await prisma.jobHistory.deleteMany({ where: { studentId } })
        if (jobs && jobs.length > 0) {
            await prisma.jobHistory.createMany({
                data: jobs.map(j => ({
                    studentId,
                    company: j.company || "",
                    position: j.position || "",
                    startDate: j.startDate ? new Date(j.startDate) : new Date(),
                    isCurrent: !!j.isCurrent
                }))
            })
        }

        // 4. Update Survey Responses
        await prisma.surveyResponse.deleteMany({ where: { studentId } })
        
        const responseData = []
        if (responses['q1']) responseData.push({ studentId, questionId: "q1", answer: String(responses['q1']) })
        if (responses['q2']) responseData.push({ studentId, questionId: "q2", answer: String(responses['q2']) })
        if (responses['q3']) responseData.push({ studentId, questionId: "q3", answer: String(responses['q3']) })

        if (responseData.length > 0) {
            await prisma.surveyResponse.createMany({ data: responseData })
        }

        return { success: true }
    } catch (error) {
        console.error("Survey submission error:", error)
        return { success: false, message: "Failed to submit survey data." }
    }
}
