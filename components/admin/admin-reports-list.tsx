"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Report, CollectionPoint } from "@/lib/types"
import { Loader2, Check, X, AlertTriangle, Filter } from "lucide-react"

interface ReportWithPoint extends Report {
  collection_points: Pick<CollectionPoint, "id" | "name" | "address">
}

interface AdminReportsListProps {
  adminRole: string
}

const REPORT_CATEGORY_LABELS: Record<string, string> = {
  incorrect_info: "Incorrect Information",
  contact_not_working: "Contact Not Working",
  location_moved: "Location Moved",
  not_operating: "Not Operating",
  fraud: "Fraud / Suspicious",
  wrong_items: "Wrong Items",
  duplicate: "Duplicate Entry",
}

export function AdminReportsList({ adminRole }: AdminReportsListProps) {
  const { toast } = useToast()
  const [reports, setReports] = useState<ReportWithPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [resolvingReport, setResolvingReport] = useState<ReportWithPoint | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const canEdit = adminRole !== "read_only"

  const fetchReports = async () => {
    const supabase = createClient()
    let query = supabase
      .from("reports")
      .select("*, collection_points(id, name, address)")
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    const { data } = await query
    if (data) setReports(data as ReportWithPoint[])
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const handleResolve = async (action: "resolved" | "rejected") => {
    if (!resolvingReport) return
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("reports")
      .update({
        status: action,
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes || null,
      })
      .eq("id", resolvingReport.id)

    setSaving(false)

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({
        title: action === "resolved" ? "Resolved" : "Rejected",
        description: `Report has been ${action}.`,
      })
      setResolvingReport(null)
      setResolutionNotes("")
      fetchReports()
    }
  }

  const handleDisablePoint = async (report: ReportWithPoint) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Disable the collection point
    await supabase.from("collection_points").update({ status: "disabled" }).eq("id", report.collection_point_id)

    // Resolve the report
    await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
        resolution_notes: "Collection point disabled based on this report.",
      })
      .eq("id", report.id)

    toast({
      title: "Point Disabled",
      description: "The collection point has been disabled and report resolved.",
    })
    fetchReports()
  }

  const getCategoryBadgeClass = (category: string) => {
    if (category === "fraud") return "bg-red-100 text-red-800"
    if (category === "not_operating") return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-gray-100 text-gray-600",
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
      {/* Filter */}
      <div className="bg-muted/30 p-4 rounded-lg border flex justify-end items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No reports found</CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className={report.category === "fraud" ? "border-destructive" : ""}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <Badge className={getCategoryBadgeClass(report.category)}>
                        {REPORT_CATEGORY_LABELS[report.category]}
                      </Badge>
                      <Badge className={getStatusBadgeClass(report.status)}>{report.status}</Badge>
                    </div>

                    {/* Related Collection Point */}
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{report.collection_points?.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{report.collection_points?.address}</p>
                    </div>

                    {report.description && <p className="text-sm mt-3">{report.description}</p>}

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Reported: {new Date(report.created_at).toLocaleDateString()}</span>
                      {report.reporter_name && <span>By: {report.reporter_name}</span>}
                      {report.reporter_contact && <span>Contact: {report.reporter_contact}</span>}
                    </div>

                    {report.resolution_notes && (
                      <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                        <strong>Resolution:</strong> {report.resolution_notes}
                      </div>
                    )}
                  </div>

                  {report.status === "pending" && canEdit && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button size="sm" onClick={() => setResolvingReport(report)} className="gap-1">
                        <Check className="h-4 w-4" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setResolvingReport(report)
                        }}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                      {report.category === "fraud" || report.category === "not_operating" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDisablePoint(report)}
                          className="gap-1"
                        >
                          Disable Point
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={!!resolvingReport} onOpenChange={(open) => !open && setResolvingReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Report</DialogTitle>
            <DialogDescription>Add resolution notes and mark this report as resolved or rejected.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Resolution Notes</Label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe the action taken..."
              className="mt-2"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setResolvingReport(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleResolve("rejected")} disabled={saving}>
              Reject Report
            </Button>
            <Button onClick={() => handleResolve("resolved")} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
