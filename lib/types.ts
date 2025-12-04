export interface CollectionPoint {
  id: string
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  contact_person: string
  contact_number: string
  operating_hours: string | null
  photo_url: string | null
  status: "pending" | "active" | "temporarily_closed" | "fully_collected" | "not_accepting" | "disabled"
  target_areas: string[]
  items_collecting: string[]
  urgency_level: "low" | "normal" | "high" | "critical"
  submitted_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface ItemCategory {
  id: string
  name: string
  name_si: string | null
  name_ta: string | null
  icon: string | null
  created_at: string
}

export interface Report {
  id: string
  collection_point_id: string
  category:
    | "incorrect_info"
    | "contact_not_working"
    | "location_moved"
    | "not_operating"
    | "fraud"
    | "wrong_items"
    | "duplicate"
  description: string | null
  photo_url: string | null
  reporter_name: string | null
  reporter_contact: string | null
  status: "pending" | "resolved" | "rejected"
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  role: "super_admin" | "moderator" | "read_only"
  display_name: string | null
  created_at: string
  updated_at: string
}

export type Language = "en" | "si" | "ta"
