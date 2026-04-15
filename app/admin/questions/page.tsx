import { getQuestions } from "./actions"
import QuestionsClient from "./QuestionsClient"

export const dynamic = 'force-dynamic'

export default async function QuestionsPage() {
    const res = await getQuestions()
    const initialData = res.success && res.data ? res.data : []
    
    return (
        <div className="animate-in fade-in duration-300">
            <QuestionsClient initialData={initialData} />
        </div>
    )
}
