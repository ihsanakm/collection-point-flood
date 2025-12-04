"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { CollectionPoint } from "@/lib/types"
import { Search, Loader2, Check, X, Edit, MapPin, Phone, Trash2, Filter } from "lucide-react"

interface AdminPointsListProps {
  adminRole: string
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "temporarily_closed", label: "Temporarily Closed" },
  { value: "fully_collected", label: "Fully Collected" },
  { value: "not_accepting", label: "Not Accepting" },
  { value: "disabled", label: "Disabled" },
]

const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

export function AdminPointsList({ adminRole }: AdminPointsListProps) {
  const { toast } = useToast()
  const [points, setPoints] = useState<CollectionPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null)
  const [saving, setSaving] = useState(false)

  const canEdit = adminRole !== "read_only"

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editUrgency, setEditUrgency] = useState("")
  const [editContactPerson, setEditContactPerson] = useState("")
  const [editContactNumber, setEditContactNumber] = useState("")

  const fetchPoints = async () => {
    const supabase = createClient()
    let query = supabase.from("collection_points").select("*").order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    const { data } = await query
    if (data) setPoints(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPoints()
  }, [statusFilter])

  const filteredPoints = points.filter((point) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return point.name.toLowerCase().includes(query) || point.address.toLowerCase().includes(query)
  })

  const openEditDialog = (point: CollectionPoint) => {
    setEditingPoint(point)
    setEditName(point.name)
    setEditAddress(point.address)
    setEditStatus(point.status)
    setEditUrgency(point.urgency_level)
    setEditContactPerson(point.contact_person)
    setEditContactNumber(point.contact_number)
  }

  const handleApprove = async (point: CollectionPoint) => {
    const supabase = createClient()
    const { error } = await supabase.from("collection_points").update({ status: "active" }).eq("id", point.id)

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Approved", description: "Collection point is now active." })
      fetchPoints()
    }
  }

  const handleReject = async (point: CollectionPoint) => {
    const supabase = createClient()
    const { error } = await supabase.from("collection_points").update({ status: "disabled" }).eq("id", point.id)

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Rejected", description: "Collection point has been disabled." })
      fetchPoints()
    }
  }

  const handleDelete = async (point: CollectionPoint) => {
    if (!confirm("Are you sure you want to permanently delete this collection point?")) return

    const supabase = createClient()
    const { error } = await supabase.from("collection_points").delete().eq("id", point.id)

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Deleted", description: "Collection point has been permanently deleted." })
      fetchPoints()
    }
  }

  const handleSaveEdit = async () => {
    if (!editingPoint) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("collection_points")
      .update({
        name: editName,
        address: editAddress,
        status: editStatus,
        urgency_level: editUrgency,
        contact_person: editContactPerson,
        contact_number: editContactNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingPoint.id)

    setSaving(false)

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Saved", description: "Changes have been saved." })
      setEditingPoint(null)
      fetchPoints()
    }
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      temporarily_closed: "bg-orange-100 text-orange-800",
      fully_collected: "bg-gray-100 text-gray-800",
      not_accepting: "bg-red-100 text-red-800",
      disabled: "bg-gray-200 text-gray-600",
    }
    return classes[status] || ""
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {/* Filters */}
      <div className="bg-muted/30 p-4 rounded-lg border flex flex-col sm:flex-row gap-6 sm:gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Points List */}
      <div className="space-y-3">
        {filteredPoints.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No collection points found</CardContent>
          </Card>
        ) : (
          filteredPoints.map((point) => (
            <Card key={point.id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-semibold">{point.name}</h3>
                      <Badge className={getStatusBadgeClass(point.status)}>{point.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {point.address}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {point.contact_person} - {point.contact_number}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted: {new Date(point.created_at).toLocaleDateString()} by{" "}
                      {point.submitted_by || "Anonymous"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {point.status === "pending" && canEdit && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(point)} className="gap-1">
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(point)} className="gap-1">
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {canEdit && (
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(point)} className="gap-1">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {adminRole === "super_admin" && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(point)} className="gap-1">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPoint} onOpenChange={(open) => !open && setEditingPoint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Collection Point</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={editUrgency} onValueChange={setEditUrgency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={editContactPerson} onChange={(e) => setEditContactPerson(e.target.value)} />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input value={editContactNumber} onChange={(e) => setEditContactNumber(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPoint(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
