"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPointsList } from "./admin-points-list"
import { AdminReportsList } from "./admin-reports-list"
import { AdminUsersList } from "./admin-users-list"
import { AdminAnalytics } from "./admin-analytics"
import { MapPin, AlertTriangle, Clock, LogOut, LayoutDashboard, Users, BarChart3 } from "lucide-react"
import type { AdminUser } from "@/lib/types"

interface AdminDashboardProps {
  adminUser: AdminUser
  stats: {
    totalPoints: number
    pendingApproval: number
    pendingReports: number
  }
}

export function AdminDashboard({ adminUser, stats }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("points")

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{adminUser.display_name || adminUser.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collection Points</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPoints}</div>
            </CardContent>
          </Card>

          <Card className={stats.pendingApproval > 0 ? "border-warning" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.pendingApproval}</div>
            </CardContent>
          </Card>

          <Card className={stats.pendingReports > 0 ? "border-destructive" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.pendingReports}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="points" className="gap-2">
              <MapPin className="h-4 w-4" />
              Collection Points
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reports
              {stats.pendingReports > 0 && (
                <span className="ml-1 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                  {stats.pendingReports}
                </span>
              )}
            </TabsTrigger>
            {adminUser.role === "super_admin" && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <AdminPointsList adminRole={adminUser.role} />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReportsList adminRole={adminUser.role} />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersList adminRole={adminUser.role} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
