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

export async function submitSurvey(
    studentId: string,
    profile: any,
    jobs: any[],
    responses: Record<string, any>  // key = questionId, value = answer string
) {
    try {
        // 1. Update Student Profile
        await prisma.student.update({
            where: { id: studentId },
            data: { email: profile.email || null, phone: profile.phone || null }
        })

        // 2. Clear and re-create Job History
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

        // 3. Clear existing survey responses for this student
        await prisma.surveyResponse.deleteMany({ where: { studentId } })

        // 4. Build response rows — only include entries that have a real questionId in DB
        //    responses object: { [questionId]: answerValue, university: "...", major: "..." }
        const allQuestions = await prisma.surveyQuestion.findMany({ select: { id: true } })
        const validIds = new Set(allQuestions.map(q => q.id))

        const responseRows: { studentId: string; questionId: string; answer: string }[] = []

        for (const [questionId, answer] of Object.entries(responses)) {
            // Skip meta keys (university, major) and empty answers
            if (!validIds.has(questionId)) continue
            if (answer === null || answer === undefined || answer === "") continue
            responseRows.push({ studentId, questionId, answer: String(answer) })
        }

        if (responseRows.length > 0) {
            await prisma.surveyResponse.createMany({ data: responseRows })
        }

        // 5. Handle special meta responses (status, university, major, dll)
        const metaFields = [
            { key: 'status', id: 'meta_status', label: 'Status Saat Ini', order: 90 },
            { key: 'university', id: 'meta_university', label: 'Perguruan Tinggi', order: 91 },
            { key: 'major', id: 'meta_major', label: 'Program Studi', order: 92 },
            { key: 'jalurMasuk', id: 'meta_jalurMasuk', label: 'Jalur Masuk', order: 93 },
            { key: 'aktivitas', id: 'meta_aktivitas', label: 'Aktivitas Saat Ini', order: 94 },
        ]

        for (const field of metaFields) {
            const answer = responses[field.key]
            if (answer) {
                await prisma.surveyQuestion.upsert({
                    where: { id: field.id },
                    create: { id: field.id, question: field.label, type: "Text", order: field.order },
                    update: {}
                })
                await prisma.surveyResponse.upsert({
                    where: { id: `${studentId}_${field.id}` },
                    create: { id: `${studentId}_${field.id}`, studentId, questionId: field.id, answer: String(answer) },
                    update: { answer: String(answer) }
                })
            }
        }

        return { success: true }
    } catch (error) {
        console.error("Survey submission error:", error)
        return { success: false, message: "Failed to submit survey data." }
    }
}

