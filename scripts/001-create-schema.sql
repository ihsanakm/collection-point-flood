-- Collection Points Table
CREATE TABLE collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_person TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  operating_hours TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'temporarily_closed', 'fully_collected', 'not_accepting', 'disabled')),
  target_areas TEXT[], -- Array of target relief areas
  items_collecting TEXT[], -- Array of item category IDs
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'critical')),
  submitted_by TEXT, -- Can be anonymous
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item Categories Table
CREATE TABLE item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_si TEXT, -- Sinhala
  name_ta TEXT, -- Tamil
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_point_id UUID NOT NULL REFERENCES collection_points(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('incorrect_info', 'contact_not_working', 'location_moved', 'not_operating', 'fraud', 'wrong_items', 'duplicate')),
  description TEXT,
  photo_url TEXT,
  reporter_name TEXT,
  reporter_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table (extends auth.users)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin', 'moderator', 'read_only')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collection_points
-- Anyone can view active collection points
CREATE POLICY "Anyone can view active collection points" ON collection_points 
  FOR SELECT USING (status = 'active' OR status = 'temporarily_closed' OR status = 'fully_collected' OR status = 'not_accepting');

-- Anyone can submit a new collection point (pending approval)
CREATE POLICY "Anyone can submit collection points" ON collection_points 
  FOR INSERT WITH CHECK (status = 'pending');

-- Admins can do everything
CREATE POLICY "Admins can manage all collection points" ON collection_points 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- RLS Policies for item_categories
-- Anyone can view item categories
CREATE POLICY "Anyone can view item categories" ON item_categories 
  FOR SELECT USING (true);

-- Only admins can manage item categories
CREATE POLICY "Admins can manage item categories" ON item_categories 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- RLS Policies for reports
-- Anyone can submit a report
CREATE POLICY "Anyone can submit reports" ON reports 
  FOR INSERT WITH CHECK (status = 'pending');

-- Only admins can view and manage reports
CREATE POLICY "Admins can manage reports" ON reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- RLS Policies for admin_users
-- Admins can view other admins
CREATE POLICY "Admins can view admin users" ON admin_users 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Create indexes for performance
CREATE INDEX idx_collection_points_status ON collection_points(status);
CREATE INDEX idx_collection_points_location ON collection_points(latitude, longitude);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_collection_point ON reports(collection_point_id);
