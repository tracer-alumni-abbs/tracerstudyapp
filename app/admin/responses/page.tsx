import { getSurveyResponses } from "./actions"
import ResponsesClient from "./ResponsesClient"

export const dynamic = 'force-dynamic'

export default async function ResponsesPage() {
    const res = await getSurveyResponses()
    const initialData = res.success && res.data ? res.data : []
    
    return <ResponsesClient initialData={initialData} />
}
