"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { useLanguage } from "./language-provider"
import type { CollectionPoint, ItemCategory } from "@/lib/types"
import { Phone, MapPin, Clock, AlertTriangle, Navigation } from "lucide-react"
import Link from "next/link"

interface CollectionPointSheetProps {
  point: CollectionPoint | null
  categories: ItemCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollectionPointSheet({ point, categories, open, onOpenChange }: CollectionPointSheetProps) {
  const { t } = useLanguage()

  if (!point) return null

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: t("active"), className: "status-active" },
      temporarily_closed: { label: t("temporarilyClosed"), className: "status-temporarily_closed" },
      fully_collected: { label: t("fullyCollected"), className: "status-fully_collected" },
      not_accepting: { label: t("notAccepting"), className: "status-not_accepting" },
    }
    const statusInfo = statusMap[status] || statusMap.active
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap: Record<string, { label: string; className: string }> = {
      low: { label: t("low"), className: "urgency-low" },
      normal: { label: t("normal"), className: "urgency-normal" },
      high: { label: t("high"), className: "urgency-high" },
      critical: { label: t("critical"), className: "urgency-critical" },
    }
    const urgencyInfo = urgencyMap[urgency] || urgencyMap.normal
    return <Badge className={urgencyInfo.className}>{urgencyInfo.label}</Badge>
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId || c.name === categoryId)
    return category?.name || categoryId
  }

  const handleCall = () => {
    window.location.href = `tel:${point.contact_number}`
  }

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`, "_blank")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-xl">{point.name}</SheetTitle>
            <div className="flex gap-2 shrink-0">
              {getStatusBadge(point.status)}
              {getUrgencyBadge(point.urgency_level)}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{point.address}</p>
              {point.description && <p className="text-sm text-muted-foreground mt-1">{point.description}</p>}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">{point.contact_person}</p>
              <p className="text-sm text-muted-foreground">{point.contact_number}</p>
            </div>
          </div>

          {/* Operating Hours */}
          {point.operating_hours && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <p>{point.operating_hours}</p>
            </div>
          )}

          {/* Items Collecting */}
          {point.items_collecting && point.items_collecting.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">{t("itemsCollecting")}</h4>
              <div className="flex flex-wrap gap-2">
                {point.items_collecting.map((item) => (
                  <Badge key={item} variant="secondary">
                    {getCategoryName(item)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Target Areas */}
          {point.target_areas && point.target_areas.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">{t("targetAreas")}</h4>
              <div className="flex flex-wrap gap-2">
                {point.target_areas.map((area) => (
                  <Badge key={area} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleCall}>
                <Phone className="mr-2 h-4 w-4" />
                {t("callNow")}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={handleDirections}>
                <Navigation className="mr-2 h-4 w-4" />
                {t("getDirections")}
              </Button>
            </div>

            <Link href={`/report?point=${point.id}`} className="w-full">
              <Button variant="outline" className="w-full text-warning bg-transparent">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {t("reportThis")}
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
