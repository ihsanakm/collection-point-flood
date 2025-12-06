# Adding Demo Collection Points to Database

## Overview
A new SQL script has been created at `scripts/005-add-more-demo-points.sql` that adds 17 additional demo collection points across Sri Lanka.

## What's Included
- **15 Active Collection Points** covering districts like:
  - Kurunegala, Trincomalee, Badulla, Polonnaruwa
  - Hambantota, Kegalle, Ampara, Puttalam
  - Monaragala, Vavuniya, Nuwara Eliya, Chilaw
  - Kalutara, Mannar, Embilipitiya
  
- **2 Pending Collection Points** for testing admin approval workflow:
  - Gampaha District Center
  - Matale Temple Relief

## How to Run the Script

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `scripts/005-add-more-demo-points.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

### Option 2: Using Supabase CLI
If you have the Supabase CLI installed:

```bash
supabase db execute -f scripts/005-add-more-demo-points.sql
```

### Option 3: Using psql (Direct Database Connection)
If you have direct database access:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f scripts/005-add-more-demo-points.sql
```

## Verification
After running the script, you can verify the data was added by:

1. **Via Supabase Dashboard:**
   - Go to **Table Editor**
   - Select `collection_points` table
   - You should see the new entries

2. **Via SQL Query:**
   ```sql
   SELECT COUNT(*) FROM collection_points;
   SELECT name, status, urgency_level FROM collection_points ORDER BY created_at DESC LIMIT 20;
   ```

3. **Via Your Application:**
   - Navigate to the map or list view
   - The new collection points should appear on the map
   - Filter by different districts to see the new points

## Notes
- All new points use the existing item categories from your database
- The script assumes the `item_categories` table is already populated (from `002-seed-categories.sql`)
- Geographic coordinates are accurate for the respective Sri Lankan cities/districts
- Contact information is fictional for demo purposes
