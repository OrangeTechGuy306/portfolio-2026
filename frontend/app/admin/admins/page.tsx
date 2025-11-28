"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Search, Shield, User, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Admin {
  id: number
  name: string
  email: string
  role: "Super Admin" | "Admin" | "Editor"
  status: "Active" | "Inactive"
  avatar: string
  lastLogin: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Super Admin",
      status: "Active",
      avatar: "/placeholder.svg?height=80&width=80",
      lastLogin: "2024-01-16",
      permissions: ["all"],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-16",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Admin",
      status: "Active",
      avatar: "/placeholder.svg?height=80&width=80",
      lastLogin: "2024-01-15",
      permissions: ["portfolio", "blog", "testimonials"],
      createdAt: "2024-01-05",
      updatedAt: "2024-01-15",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Editor",
      status: "Inactive",
      avatar: "/placeholder.svg?height=80&width=80",
      lastLogin: "2024-01-10",
      permissions: ["blog"],
      createdAt: "2024-01-08",
      updatedAt: "2024-01-10",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState<Partial<Admin>>({
    name: "",
    email: "",
    role: "Editor",
    status: "Active",
    avatar: "",
    permissions: [],
  })

  const { toast } = useToast()

  const roles = ["All", "Super Admin", "Admin", "Editor"]
  const statuses = ["All", "Active", "Inactive"]
  const availablePermissions = ["portfolio", "experience", "blog", "testimonials", "admins", "settings"]

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "All" || admin.role === filterRole
    const matchesStatus = filterStatus === "All" || admin.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingAdmin) {
        const updatedAdmins = admins.map((admin) =>
          admin.id === editingAdmin.id
            ? {
                ...admin,
                ...formData,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : admin,
        )
        setAdmins(updatedAdmins)
        toast({
          title: "Admin updated successfully!",
          description: "The admin user has been updated.",
        })
      } else {
        const newAdmin: Admin = {
          id: Date.now(),
          ...(formData as Admin),
          lastLogin: "Never",
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        }
        setAdmins([...admins, newAdmin])
        toast({
          title: "Admin created successfully!",
          description: "The new admin user has been added.",
        })
      }

      setIsDialogOpen(false)
      setEditingAdmin(null)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "Editor",
      status: "Active",
      avatar: "",
      permissions: [],
    })
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData(admin)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (id === 1) {
      toast({
        title: "Cannot delete Super Admin",
        description: "The Super Admin account cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setAdmins(admins.filter((admin) => admin.id !== id))
    toast({
      title: "Admin deleted",
      description: "The admin user has been successfully deleted.",
    })
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = formData.permissions || []
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permission],
      })
    } else {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter((p) => p !== permission),
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-red-500"
      case "Admin":
        return "bg-blue-500"
      case "Editor":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-foreground/60">Manage admin users and their permissions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAdmin ? "Edit Admin User" : "Add New Admin User"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "Super Admin" | "Admin" | "Editor") =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Active" | "Inactive") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {formData.role !== "Super Admin" && (
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Switch
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                        />
                        <Label htmlFor={permission} className="capitalize">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingAdmin(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                >
                  {editingAdmin ? "Update" : "Add"} Admin
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins.map((admin, index) => (
          <motion.div
            key={admin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={admin.avatar || "/placeholder.svg"}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{admin.name}</h3>
                      <div className="flex items-center text-sm text-foreground/60">
                        <Mail className="w-3 h-3 mr-1" />
                        {admin.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getRoleColor(admin.role)}>{admin.role}</Badge>
                    <Badge className={admin.status === "Active" ? "bg-green-500" : "bg-gray-500"}>{admin.status}</Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-foreground/60">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>Last login: {admin.lastLogin}</span>
                  </div>

                  {admin.permissions.length > 0 && admin.role !== "Super Admin" && (
                    <div>
                      <p className="text-sm font-medium mb-1">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs capitalize">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {admin.role === "Super Admin" && (
                    <div className="flex items-center text-sm text-orange-500">
                      <Shield className="w-3 h-3 mr-1" />
                      <span>All permissions</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-foreground/60 mb-4">
                  <span>Created: {admin.createdAt}</span>
                  <span>Updated: {admin.updatedAt}</span>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(admin)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={admin.id === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No admin users found</h3>
            <p className="text-foreground/60 mb-4">
              {searchTerm || filterRole !== "All" || filterStatus !== "All"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first admin user"}
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
