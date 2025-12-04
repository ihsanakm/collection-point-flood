"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { createClient } from "@/lib/supabase/client"
import type { CollectionPoint } from "@/lib/types"
import { Loader2, AlertTriangle } from "lucide-react"

const REPORT_CATEGORIES = [
  { value: "incorrect_info", label: "Incorrect Information" },
  { value: "contact_not_working", label: "Contact Number Not Working" },
  { value: "location_moved", label: "Location Has Moved" },
  { value: "not_operating", label: "Not Operating Anymore" },
  { value: "fraud", label: "Fraud / Suspicious Activity" },
  { value: "wrong_items", label: "Wrong Items Listed" },
  { value: "duplicate", label: "Duplicate Entry" },
]

function ReportForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t } = useLanguage()

  const preselectedPointId = searchParams.get("point")

  const [points, setPoints] = useState<CollectionPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingPoints, setFetchingPoints] = useState(true)

  // Form state
  const [selectedPointId, setSelectedPointId] = useState(preselectedPointId || "")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [reporterContact, setReporterContact] = useState("")

  useEffect(() => {
    async function fetchPoints() {
      const supabase = createClient()
      const { data } = await supabase
        .from("collection_points")
        .select("id, name, address")
        .in("status", ["active", "temporarily_closed", "fully_collected", "not_accepting"])
        .order("name")

      if (data) setPoints(data as CollectionPoint[])
      setFetchingPoints(false)
    }
    fetchPoints()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPointId || !category) {
      toast({
        title: "Missing Information",
        description: "Please select a collection point and report category.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("reports").insert({
      collection_point_id: selectedPointId,
      category,
      description: description || null,
      reporter_name: reporterName || null,
      reporter_contact: reporterContact || null,
      status: "pending",
    })

    setLoading(false)

    if (error) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: t("reportSubmitted"),
        description: "Thank you for helping us maintain accurate information.",
      })
      router.push("/")
    }
  }

  const selectedPoint = points.find((p) => p.id === selectedPointId)

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("reportIssue")}</h1>
            <p className="text-sm text-muted-foreground">Help us maintain accurate information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Collection Point */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collection Point</CardTitle>
            </CardHeader>
            <CardContent>
              {fetchingPoints ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading points...</span>
                </div>
              ) : (
                <Select value={selectedPointId} onValueChange={setSelectedPointId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection point" />
                  </SelectTrigger>
                  <SelectContent>
                    {points.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        <div className="flex flex-col">
                          <span>{point.name}</span>
                          <span className="text-xs text-muted-foreground">{point.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedPoint && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedPoint.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPoint.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue Type *</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={category} onValueChange={setCategory}>
                <div className="space-y-3">
                  {REPORT_CATEGORIES.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={cat.value} id={cat.value} />
                      <Label htmlFor={cat.value} className="flex-1 cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide any additional details about this issue..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Reporter Info (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Information (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reporterName">Your Name</Label>
                <Input
                  id="reporterName"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your name (optional)"
                />
              </div>
              <div>
                <Label htmlFor="reporterContact">Contact Number</Label>
                <Input
                  id="reporterContact"
                  type="tel"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="In case we need to follow up"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full h-12" disabled={loading || !selectedPointId || !category}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">All reports are reviewed by our moderation team.</p>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ReportForm />
    </Suspense>
  )
}
