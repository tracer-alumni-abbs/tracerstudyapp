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
        // 1. Update Student Profile & survey metadata
        await prisma.student.update({
            where: { id: studentId },
            data: { 
                email: profile.email || null, 
                phone: profile.phone || null,
                surveyStatus: responses.status || null,
                surveyUniversity: responses.university || null,
                surveyMajor: responses.major || null,
                surveyJalurMasuk: responses.jalurMasuk || null,
                surveyAktivitas: responses.aktivitas || null,
            }
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
            // Skip only meta/profile keys that are NOT valid question IDs
            const skipKeys = new Set(['status', 'university', 'major', 'jalurMasuk', 'aktivitas'])
            if (skipKeys.has(questionId)) continue
            if (!validIds.has(questionId)) continue
            if (answer === null || answer === undefined || answer === "") continue
            responseRows.push({ studentId, questionId, answer: String(answer) })
        }

        if (responseRows.length > 0) {
            await prisma.surveyResponse.createMany({ data: responseRows })
        }

        return { success: true }
    } catch (error) {
        console.error("Survey submission error:", error)
        return { success: false, message: "Failed to submit survey data." }
    }
}

