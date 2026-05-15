import { getUniversities } from "./actions"
import OptionsClient from "./OptionsClient"

export const dynamic = 'force-dynamic'

export default async function OptionsPage() {
    const res = await getUniversities()
    const universities = res.success && res.data ? res.data : []
    
    return (
        <div className="animate-in fade-in duration-300">
            <OptionsClient initialUniversities={universities} />
        </div>
    )
}
