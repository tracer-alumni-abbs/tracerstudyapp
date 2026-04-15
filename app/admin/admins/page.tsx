import { getAdmins } from "./actions"
import AdminsClient from "./AdminsClient"

export const dynamic = 'force-dynamic'

export default async function AdminsPage() {
    const res = await getAdmins()
    const initialData = res.success && res.data ? res.data : []
    return <AdminsClient initialData={initialData} />
}
