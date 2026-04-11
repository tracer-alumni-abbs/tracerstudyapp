import { getStudent } from "./actions"
import FormClient from "./FormClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SurveyFormPage({ params }: { params: Promise<{ studentId: string }> }) {
    const p = await params
    const result = await getStudent(p.studentId)
    
    // Auto-redirect if student not found to avoid client-side flash
    if (!result.success || !result.data) {
        redirect("/search?error=not-found")
    }

    return <FormClient studentId={p.studentId} initialProfile={result.data} />
}
