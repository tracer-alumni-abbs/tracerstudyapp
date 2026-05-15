import { getStudent } from "./actions"
import FormClient from "./FormClient"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function SurveyFormPage({ params }: { params: Promise<{ studentId: string }> }) {
    const p = await params
    const result = await getStudent(p.studentId)

    if (!result.success || !result.data) {
        redirect("/search?error=not-found")
    }

    // Fetch dynamic survey questions from DB
    const questions = await prisma.surveyQuestion.findMany({
        orderBy: { order: 'asc' }
    })

    // Fetch select options for university/major dropdowns
    const universities = await prisma.university.findMany({
        include: { programs: { orderBy: { name: 'asc' } } },
        orderBy: { name: 'asc' }
    })

    return (
        <FormClient
            studentId={p.studentId}
            initialProfile={result.data}
            questions={questions.map(q => ({
                id: q.id,
                questionEn: q.questionEn,
                questionId: q.questionId,
                type: q.type,
                optionsEn: q.optionsEn ? JSON.parse(q.optionsEn) : [],
                optionsId: q.optionsId ? JSON.parse(q.optionsId) : [],
                order: q.order,
                isStandard: q.isStandard,
                standardKey: q.standardKey
            }))}
            universities={universities.map(u => ({
                id: u.id,
                name: u.name,
                programs: u.programs.map(pr => ({ id: pr.id, name: pr.name, level: pr.level }))
            }))}
        />
    )
}
