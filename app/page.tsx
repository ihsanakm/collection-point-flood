"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { useLanguage } from "@/components/language-provider"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Plus, AlertTriangle, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { t } = useLanguage()
  const [activePoints, setActivePoints] = useState<number>(0)
  const [districtsCovered, setDistrictsCovered] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const supabase = createClient()

      // Fetch active collection points
      const { data: points, error } = await supabase
        .from("collection_points")
        .select("address")
        .eq("status", "active")

      if (error) throw error

      setActivePoints(points?.length || 0)

      // Calculate unique districts from addresses
      if (points && points.length > 0) {
        const districts = new Set(
          points.map((p) => {
            // Extract district from address (assuming format like "City, District")
            const parts = p.address.split(",")
            return parts[parts.length - 1]?.trim() || ""
          }).filter(Boolean)
        )
        setDistrictsCovered(districts.size)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground text-balance">Help Sri Lanka Recover</h2>
          <p className="text-muted-foreground text-pretty">
            Find collection points near you or add new ones to support flood relief efforts.
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          <Link href="/map" className="block">
            <Card className="border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary">
                  <MapPin className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("findPoints")}</h3>
                  <p className="text-sm text-muted-foreground">View collection points on map or list</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/add" className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-success">
                  <Plus className="h-7 w-7 text-success-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("addPoint")}</h3>
                  <p className="text-sm text-muted-foreground">Register a new collection point</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/report" className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-warning">
                  <AlertTriangle className="h-7 w-7 text-warning-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t("reportIssue")}</h3>
                  <p className="text-sm text-muted-foreground">Report incorrect or suspicious information</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {loading ? "..." : activePoints}
              </div>
              <div className="text-sm text-muted-foreground">Active Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-success">
                {loading ? "..." : districtsCovered}
              </div>
              <div className="text-sm text-muted-foreground">Districts Covered</div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
