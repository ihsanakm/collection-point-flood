"use client"

import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { useLanguage } from "./language-provider"
import type { CollectionPoint, ItemCategory } from "@/lib/types"
import { MapPin, Clock, Phone } from "lucide-react"

interface CollectionPointCardProps {
  point: CollectionPoint
  categories: ItemCategory[]
  distance: number | null
  onClick: () => void
}

export function CollectionPointCard({ point, categories, distance, onClick }: CollectionPointCardProps) {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: t("active"), className: "status-active" },
      temporarily_closed: { label: t("temporarilyClosed"), className: "status-temporarily_closed" },
      fully_collected: { label: t("fullyCollected"), className: "status-fully_collected" },
      not_accepting: { label: t("notAccepting"), className: "status-not_accepting" },
    }
    return statusMap[status] || statusMap.active
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap: Record<string, { label: string; className: string }> = {
      low: { label: t("low"), className: "urgency-low" },
      normal: { label: t("normal"), className: "urgency-normal" },
      high: { label: t("high"), className: "urgency-high" },
      critical: { label: t("critical"), className: "urgency-critical" },
    }
    return urgencyMap[urgency] || urgencyMap.normal
  }

  const getCategoryNames = () => {
    if (!point.items_collecting) return []
    return point.items_collecting.slice(0, 3).map((item) => {
      const category = categories.find((c) => c.id === item || c.name === item)
      return category?.name || item
    })
  }

  const status = getStatusBadge(point.status)
  const urgency = getUrgencyBadge(point.urgency_level)
  const itemNames = getCategoryNames()
  const hasMore = (point.items_collecting?.length || 0) > 3

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{point.name}</h3>

            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{point.address}</span>
            </div>

            {distance !== null && (
              <p className="text-sm text-primary mt-1">
                {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={status.className} variant="secondary">
              {status.label}
            </Badge>
            {(point.urgency_level === "high" || point.urgency_level === "critical") && (
              <Badge className={urgency.className} variant="secondary">
                {urgency.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Items collecting */}
        {itemNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {itemNames.map((name) => (
              <Badge key={name} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
            {hasMore && (
              <Badge variant="outline" className="text-xs">
                +{(point.items_collecting?.length || 0) - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Quick info */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {point.operating_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{point.operating_hours}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>{point.contact_number}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
