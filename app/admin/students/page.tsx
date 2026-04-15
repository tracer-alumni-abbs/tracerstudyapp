import { getStudents } from "./actions"
import StudentsClient from "./StudentsClient"

export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
    const res = await getStudents()
    const initialData = res.success && res.data ? res.data : []
    return (
        <div className="animate-in fade-in duration-300">
            <StudentsClient initialData={initialData} />
        </div>
    )
}
