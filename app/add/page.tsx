"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"
import type { ItemCategory } from "@/lib/types"
import { MapPin, Loader2 } from "lucide-react"

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((mod) => mod.LocationPicker),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-screen">Loading map...</div> }
)

export default function AddPointPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [categories, setCategories] = useState<ItemCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [targetAreas, setTargetAreas] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [submitterName, setSubmitterName] = useState("")

  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from("item_categories").select("*")
        if (data) setCategories(data)
      } catch (error) {
        console.log("[v0] Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !address || !contactPerson || !contactNumber || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a location.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("collection_points").insert({
        name,
        address,
        description: description || null,
        contact_person: contactPerson,
        contact_number: contactNumber,
        operating_hours: operatingHours || null,
        latitude: location.lat,
        longitude: location.lng,
        target_areas: targetAreas ? targetAreas.split(",").map((a) => a.trim()) : [],
        items_collecting: selectedCategories,
        submitted_by: submitterName || "Anonymous",
        status: "pending",
        urgency_level: "normal",
      })

      if (error) {
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("submittedForApproval"),
          description: "Your collection point will be reviewed by our team.",
        })
        router.push("/")
      }
    } catch (error) {
      console.log("[v0] Submit error:", error)
      toast({
        title: t("error"),
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  if (showMap) {
    return (
      <LocationPicker
        selectedLocation={location}
        onLocationSelect={handleLocationSelect}
        onCancel={() => setShowMap(false)}
        onConfirm={() => setShowMap(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t("addPoint")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Point Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Colombo Community Center"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address of the collection point"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details about this collection point"
                />
              </div>

              {/* Location Picker */}
              <div>
                <Label>Location *</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-1 justify-start bg-transparent"
                  onClick={() => setShowMap(true)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {location
                    ? `Selected: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : "Tap to select location on map"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Name of responsible person"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+94 XX XXX XXXX"
                  required
                />
              </div>

              <div>
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input
                  id="operatingHours"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g., 8:00 AM - 6:00 PM"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Collecting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("itemsCollecting")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("targetAreas")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="targetAreas">Target Relief Areas</Label>
                <Input
                  id="targetAreas"
                  value={targetAreas}
                  onChange={(e) => setTargetAreas(e.target.value)}
                  placeholder="e.g., Galle, Matara, Hambantota (comma separated)"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate multiple areas with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Submitter Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="submitterName">Your Name</Label>
                <Input
                  id="submitterName"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Your name (optional)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              t("submit")
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Your submission will be reviewed before being published.
          </p>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
