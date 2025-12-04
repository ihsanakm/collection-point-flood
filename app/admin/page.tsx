import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) redirect("/admin/login")

  // Fetch stats
  const [pointsRes, pendingRes, reportsRes] = await Promise.all([
    supabase.from("collection_points").select("*", { count: "exact" }),
    supabase.from("collection_points").select("*", { count: "exact" }).eq("status", "pending"),
    supabase.from("reports").select("*", { count: "exact" }).eq("status", "pending"),
  ])

  const stats = {
    totalPoints: pointsRes.count || 0,
    pendingApproval: pendingRes.count || 0,
    pendingReports: reportsRes.count || 0,
  }

  return <AdminDashboard adminUser={adminUser} stats={stats} />
}
