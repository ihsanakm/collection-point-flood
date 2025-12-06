"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { CollectionPointCard } from "@/components/collection-point-card"
import { CollectionPointSheet } from "@/components/collection-point-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"
import type { CollectionPoint, ItemCategory } from "@/lib/types"
import { Search, SlidersHorizontal, Loader2, MapPin } from "lucide-react"

export default function ListPage() {
  const { t } = useLanguage()
  const [points, setPoints] = useState<CollectionPoint[]>([])
  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [sortByNearest, setSortByNearest] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      console.log("Fetching list data...")
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

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {},
      )
    }
  }, [])

  // Calculate distance
  const getDistance = (lat: number, lng: number) => {
    if (!userLocation) return null
    const R = 6371 // Earth's radius in km
    const dLat = ((lat - userLocation.lat) * Math.PI) / 180
    const dLon = ((lng - userLocation.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter and sort points
  const filteredPoints = useMemo(() => {
    let result = [...points]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.target_areas?.some((a) => a.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => p.items_collecting?.some((item) => selectedCategories.includes(item)))
    }

    // Urgent only filter
    if (urgentOnly) {
      result = result.filter((p) => p.urgency_level === "critical" || p.urgency_level === "high")
    }

    // Sort by nearest
    if (sortByNearest && userLocation) {
      result.sort((a, b) => {
        const distA = getDistance(a.latitude, a.longitude) || Number.POSITIVE_INFINITY
        const distB = getDistance(b.latitude, b.longitude) || Number.POSITIVE_INFINITY
        return distA - distB
      })
    }

    return result
  }, [points, searchQuery, selectedCategories, urgentOnly, sortByNearest, userLocation])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setUrgentOnly(false)
    setSortByNearest(false)
    setSearchQuery("")
  }

  const activeFilterCount = selectedCategories.length + (urgentOnly ? 1 : 0) + (sortByNearest ? 1 : 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <div className="sticky top-[57px] z-30 bg-background border-b border-border px-4 py-3">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, address, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>{t("filterBy")}</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Sort Options */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nearest"
                      checked={sortByNearest}
                      onCheckedChange={(checked) => setSortByNearest(!!checked)}
                    />
                    <Label htmlFor="nearest">{t("nearest")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgent"
                      checked={urgentOnly}
                      onCheckedChange={(checked) => setUrgentOnly(!!checked)}
                    />
                    <Label htmlFor="urgent">{t("urgentOnly")}</Label>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h4 className="font-semibold mb-3">{t("itemsCollecting")}</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={category.id}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {sortByNearest && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {t("nearest")}
              </Badge>
            )}
            {urgentOnly && (
              <Badge variant="secondary" className="urgency-critical">
                {t("urgentOnly")}
              </Badge>
            )}
            {selectedCategories.map((catId) => {
              const cat = categories.find((c) => c.id === catId)
              return (
                <Badge key={catId} variant="secondary">
                  {cat?.name || catId}
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      <main className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No collection points found</p>
            {activeFilterCount > 0 && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filteredPoints.length} collection point{filteredPoints.length !== 1 ? "s" : ""} found
            </p>
            {filteredPoints.map((point) => (
              <CollectionPointCard
                key={point.id}
                point={point}
                categories={categories}
                distance={getDistance(point.latitude, point.longitude)}
                onClick={() => setSelectedPoint(point)}
              />
            ))}
          </div>
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
