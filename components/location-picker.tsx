"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { Button } from "./ui/button"
import { Locate, Plus, Minus } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LocationPickerProps {
  selectedLocation?: { lat: number; lng: number } | null
  onLocationSelect: (lat: number, lng: number) => void
  onCancel: () => void
  onConfirm: () => void
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

// Component to handle map clicks
function LocationPickerHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
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

export function LocationPicker({ selectedLocation, onLocationSelect, onCancel, onConfirm }: LocationPickerProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(SRI_LANKA_CENTER)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(loc)
          setMapCenter([loc.lat, loc.lng])
          setZoom(12)
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

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b">
        <h2 className="font-semibold">Tap on the map to select location</h2>
        <p className="text-sm text-muted-foreground">Pinch to zoom, tap to place marker</p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          className="h-full w-full z-0"
          zoomControl={false}
          style={{ cursor: "crosshair" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenterUpdater center={mapCenter} zoom={zoom} />
          <LocationPickerHandler onLocationSelect={onLocationSelect} />

          {/* Selected Location Marker */}
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={L.divIcon({
                className: "selected-location-marker",
                html: `
                  <svg width="40" height="50" viewBox="0 0 32 40">
                    <path
                      d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z"
                      fill="#3b82f6"
                    />
                    <circle cx="16" cy="14" r="6" fill="white" />
                  </svg>
                `,
                iconSize: [40, 50],
                iconAnchor: [20, 50],
              })}
            />
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
            />
          )}
        </MapContainer>

        {/* Coordinates display */}
        <div className="absolute top-4 left-4 rounded-lg bg-card/95 px-3 py-2 shadow-lg backdrop-blur text-xs z-[1000]">
          <div className="font-medium">
            Center: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
          </div>
          {selectedLocation && (
            <div className="text-primary font-semibold mt-1">
              Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </div>
          )}
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
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-card border-t safe-area-bottom">
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm} disabled={!selectedLocation}>
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  )
}
