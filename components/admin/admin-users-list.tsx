"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Trash2, Loader2, Shield } from "lucide-react"
import type { AdminUser } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AdminUsersListProps {
    adminRole: string
}

export function AdminUsersList({ adminRole }: AdminUsersListProps) {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const { toast } = useToast()

    // Add user form state
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserRole, setNewUserRole] = useState<"super_admin" | "moderator" | "read_only">("moderator")
    const [newUserDisplayName, setNewUserDisplayName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const canManageUsers = adminRole === "super_admin"

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error("Error fetching users:", error)
            toast({
                title: "Error",
                description: "Failed to load admin users",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            // Call the API route to create the user
            const response = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: newUserEmail,
                    role: newUserRole,
                    displayName: newUserDisplayName,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create user")
            }

            toast({
                title: "Success",
                description: "Admin user created successfully",
            })

            setAddDialogOpen(false)
            setNewUserEmail("")
            setNewUserDisplayName("")
            setNewUserRole("moderator")
            fetchUsers()
        } catch (error) {
            console.error("Error adding user:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create admin user",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateRole = async (userId: string, newRole: "super_admin" | "moderator" | "read_only") => {
        try {
            const supabase = createClient()
            const { error } = await supabase.from("admin_users").update({ role: newRole }).eq("id", userId)

            if (error) throw error

            toast({
                title: "Success",
                description: "User role updated",
            })

            fetchUsers()
        } catch (error) {
            console.error("Error updating role:", error)
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            })
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this admin user?")) return

        try {
            const supabase = createClient()
            const { error } = await supabase.from("admin_users").delete().eq("id", userId)

            if (error) throw error

            toast({
                title: "Success",
                description: "Admin user removed",
            })

            fetchUsers()
        } catch (error) {
            console.error("Error deleting user:", error)
            toast({
                title: "Error",
                description: "Failed to remove admin user",
                variant: "destructive",
            })
        }
    }

    if (!canManageUsers) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You don't have permission to manage users</p>
                    <p className="text-sm mt-2">Only super admins can access this feature</p>
                </CardContent>
            </Card>
        )
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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Admin Users</CardTitle>
                        <CardDescription>Manage admin user accounts and permissions</CardDescription>
                    </div>
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Admin User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleAddUser}>
                                <DialogHeader>
                                    <DialogTitle>Add New Admin User</DialogTitle>
                                    <DialogDescription>Create a new admin account with specified permissions</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                            placeholder="admin@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="displayName">Display Name (Optional)</Label>
                                        <Input
                                            id="displayName"
                                            value={newUserDisplayName}
                                            onChange={(e) => setNewUserDisplayName(e.target.value)}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                                <SelectItem value="moderator">Moderator</SelectItem>
                                                <SelectItem value="read_only">Read Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create User"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email / Display Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No admin users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.display_name || "No name"}</div>
                                                <div className="text-sm text-muted-foreground">{user.id.substring(0, 8)}...</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={user.role} onValueChange={(value: any) => handleUpdateRole(user.id, value)}>
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                                    <SelectItem value="moderator">Moderator</SelectItem>
                                                    <SelectItem value="read_only">Read Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
