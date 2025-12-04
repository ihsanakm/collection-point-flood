"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import type { CollectionPoint } from "@/lib/types"
import { Button } from "./ui/button"
import { Locate, Plus, Minus } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapViewProps {
  points: CollectionPoint[]
  onSelectPoint: (point: CollectionPoint) => void
  selectedLocation?: { lat: number; lng: number } | null
  onLocationSelect?: (lat: number, lng: number) => void
  isLocationPicker?: boolean
}

// Sri Lanka center coordinates
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718]
const DEFAULT_ZOOM = 8

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Custom marker icons for different urgency levels
const createCustomIcon = (urgency: string) => {
  const colors: Record<string, string> = {
    critical: "#ef4444",
    high: "#f97316",
    normal: "#3b82f6",
    low: "#22c55e",
  }

  const color = colors[urgency] || colors.normal

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="position: relative;">
        <svg width="32" height="40" viewBox="0 0 32 40">
          <path
            d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z"
            fill="${color}"
          />
          <circle cx="16" cy="14" r="6" fill="white" />
        </svg>
        ${urgency === "critical" ? '<span style="position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; border-radius: 50%; background: #ef4444; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>' : ""}
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

// Component to handle map clicks for location picker
function LocationPickerHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// Component to handle locate me functionality
function LocateControl({ onLocate }: { onLocate: () => void }) {
  return null
}

// Component to update map center
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export function MapView({
  points,
  onSelectPoint,
  selectedLocation,
  onLocationSelect,
  isLocationPicker = false,
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(SRI_LANKA_CENTER)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // User denied location, use default
        },
      )
    }
  }, [])

  const handleLocateMe = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setZoom(12)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "normal":
        return "text-blue-500"
      default:
        return "text-green-500"
    }
  }

  if (!mounted) {
    return (
      <div className="relative h-[calc(100vh-140px)] w-full flex items-center justify-center bg-blue-50">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-140px)] w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full z-0"
        zoomControl={false}
        style={{ cursor: isLocationPicker ? "crosshair" : "grab" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater center={mapCenter} zoom={zoom} />

        {isLocationPicker && <LocationPickerHandler onLocationSelect={onLocationSelect} />}

        {/* Collection Point Markers */}
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createCustomIcon(point.urgency_level)}
            eventHandlers={{
              click: () => onSelectPoint(point),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold">{point.name}</h3>
                <p className="text-sm text-muted-foreground">{point.address}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(point.urgency_level)}`}>
                  {point.urgency_level}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected Location Marker (for picker mode) */}
        {isLocationPicker && selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>Selected Location</strong>
                <br />
                Lat: {selectedLocation.lat.toFixed(4)}
                <br />
                Lng: {selectedLocation.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* User Location */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: "user-location-marker",
              html: '<div style="width: 16px; height: 16px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur text-xs z-[1000]">
        <div className="font-semibold mb-2">Urgency Level</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-[1000]">
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg" onClick={handleLocateMe}>
          <Locate className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={() => setZoom(Math.min(zoom + 1, 18))}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg"
          onClick={() => setZoom(Math.max(zoom - 1, 5))}
        >
          <Minus className="h-5 w-5" />
        </Button>
      </div>

      {/* Info overlay when no points */}
      {points.length === 0 && !isLocationPicker && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-center p-6">
            <p className="text-muted-foreground">No collection points found</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to add one!</p>
          </div>
        </div>
      )}
    </div>
  )
}
