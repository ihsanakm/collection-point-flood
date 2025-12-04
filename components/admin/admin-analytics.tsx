"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import type { CollectionPoint } from "@/lib/types"

export function AdminAnalytics() {
    const [loading, setLoading] = useState(true)
    const [points, setPoints] = useState<CollectionPoint[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase.from("collection_points").select("*")

            if (error) throw error
            setPoints(data || [])
        } catch (error) {
            console.error("Error fetching analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    // Calculate statistics
    const statusCounts = {
        active: points.filter((p) => p.status === "active").length,
        pending: points.filter((p) => p.status === "pending").length,
        temporarily_closed: points.filter((p) => p.status === "temporarily_closed").length,
        fully_collected: points.filter((p) => p.status === "fully_collected").length,
        not_accepting: points.filter((p) => p.status === "not_accepting").length,
    }

    const urgencyCounts = {
        critical: points.filter((p) => p.urgency_level === "critical").length,
        high: points.filter((p) => p.urgency_level === "high").length,
        normal: points.filter((p) => p.urgency_level === "normal").length,
        low: points.filter((p) => p.urgency_level === "low").length,
    }

    const recentPoints = points
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Collection Points by Status</CardTitle>
                    <CardDescription>Distribution of collection points across different statuses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-sm">Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{statusCounts.active}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((statusCounts.active / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <span className="text-sm">Pending Approval</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{statusCounts.pending}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((statusCounts.pending / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-orange-500" />
                                <span className="text-sm">Temporarily Closed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{statusCounts.temporarily_closed}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((statusCounts.temporarily_closed / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-gray-500" />
                                <span className="text-sm">Fully Collected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{statusCounts.fully_collected}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((statusCounts.fully_collected / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Urgency Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Collection Points by Urgency</CardTitle>
                    <CardDescription>Distribution of collection points by urgency level</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="text-sm">Critical</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-red-500">{urgencyCounts.critical}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((urgencyCounts.critical / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-orange-500" />
                                <span className="text-sm">High</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-orange-500">{urgencyCounts.high}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((urgencyCounts.high / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span className="text-sm">Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-blue-500">{urgencyCounts.normal}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((urgencyCounts.normal / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="text-sm">Low</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-green-500">{urgencyCounts.low}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({((urgencyCounts.low / points.length) * 100).toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Collection Points</CardTitle>
                    <CardDescription>Latest 5 collection points added to the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentPoints.map((point) => (
                            <div key={point.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{point.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{point.address}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${point.status === "active" ? "bg-green-100 text-green-800" :
                                                point.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-gray-100 text-gray-800"
                                            }`}>
                                            {point.status}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${point.urgency_level === "critical" ? "bg-red-100 text-red-800" :
                                                point.urgency_level === "high" ? "bg-orange-100 text-orange-800" :
                                                    point.urgency_level === "normal" ? "bg-blue-100 text-blue-800" :
                                                        "bg-green-100 text-green-800"
                                            }`}>
                                            {point.urgency_level}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(point.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
