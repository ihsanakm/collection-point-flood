import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if the requesting user is a super admin
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single()

        if (!adminUser || adminUser.role !== "super_admin") {
            return NextResponse.json({ error: "Only super admins can create admin users" }, { status: 403 })
        }

        // Get the request body
        const body = await request.json()
        const { email, role, displayName } = body

        // Create the user using the service role
        // Note: This requires SUPABASE_SERVICE_ROLE_KEY in environment variables
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!serviceRoleKey) {
            return NextResponse.json(
                { error: "Server configuration error: Service role key not found" },
                { status: 500 },
            )
        }

        // Create Supabase admin client with service role
        const { createClient: createServiceClient } = await import("@supabase/supabase-js")
        const adminClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        )

        // Create the auth user
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            email_confirm: true,
        })

        if (authError) throw authError

        // Add to admin_users table
        const { error: insertError } = await supabase.from("admin_users").insert({
            id: authData.user.id,
            role,
            display_name: displayName || null,
        })

        if (insertError) throw insertError

        return NextResponse.json({ success: true, user: authData.user })
    } catch (error) {
        console.error("Error creating admin user:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create admin user" },
            { status: 500 },
        )
    }
}
