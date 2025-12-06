"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { CollectionPointSheet } from "@/components/collection-point-sheet"
import { createClient } from "@/lib/supabase/client"
import type { CollectionPoint, ItemCategory } from "@/lib/types"
import { Loader2 } from "lucide-react"

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> }
)

export default function MapPage() {
  const [points, setPoints] = useState<CollectionPoint[]>([])
  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      console.log("Fetching map data...")
      const [pointsRes, categoriesRes] = await Promise.all([
        supabase
          .from("collection_points")
          .select("*")
          .in("status", ["active", "temporarily_closed", "fully_collected", "not_accepting"])
          .order("created_at", { ascending: false }),
        supabase.from("item_categories").select("*"),
      ])

      if (pointsRes.error) {
        console.error("Error fetching points:", pointsRes.error)
      } else {
        console.log("Fetched points:", pointsRes.data?.length)
      }

      if (categoriesRes.error) {
        console.error("Error fetching categories:", categoriesRes.error)
      }

      if (pointsRes.data) setPoints(pointsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="relative flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <MapView points={points} onSelectPoint={setSelectedPoint} />
        )}
      </main>

      <CollectionPointSheet
        point={selectedPoint}
        categories={categories}
        open={!!selectedPoint}
        onOpenChange={(open) => !open && setSelectedPoint(null)}
      />

      <BottomNav />
    </div>
  )
}
