"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Loader2, Settings, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import axios from "axios"

interface Service {
    _id: string
    title: string
    description: string
    icon: string
    features: string[]
    status: "active" | "inactive"
    sortOrder: number
    createdAt: string
    updatedAt: string
}

export default function ServicesManagement() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "",
        features: [] as string[],
        status: "active" as "active" | "inactive",
        sortOrder: 0,
    })

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            setLoading(true)
            const response = await axios.get("/api/services?limit=100")
            setServices(response.data.data.services)
        } catch (error) {
            toast.error("Failed to load services")
            console.error("Error fetching services:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            if (editingService) {
                await axios.put(`/api/services/${editingService._id}`, formData)
                toast.success("Service updated successfully!")
            } else {
                await axios.post("/api/services", formData)
                toast.success("Service created successfully!")
            }

            setIsDialogOpen(false)
            resetForm()
            await fetchServices()
        } catch (error) {
            toast.error("Failed to save service")
            console.error("Error saving service:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (service: Service) => {
        setEditingService(service)
        setFormData({
            title: service.title,
            description: service.description,
            icon: service.icon,
            features: service.features,
            status: service.status,
            sortOrder: service.sortOrder,
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return

        try {
            await axios.delete(`/api/services/${id}`)
            toast.success("Service deleted successfully!")
            await fetchServices()
        } catch (error) {
            toast.error("Failed to delete service")
            console.error("Error deleting service:", error)
        }
    }

    const resetForm = () => {
        setEditingService(null)
        setFormData({
            title: "",
            description: "",
            icon: "",
            features: [],
            status: "active",
            sortOrder: 0,
        })
    }

    const handleFeaturesChange = (value: string) => {
        const features = value
            .split("\n")
            .map((f) => f.trim())
            .filter((f) => f)
        setFormData({ ...formData, features })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Services Management</h1>
                    <p className="text-foreground/60">Manage the services you offer</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={resetForm}
                            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingService ? "Edit Service" : "Create New Service"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Web Development"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="icon">Icon (Lucide Icon Name) *</Label>
                                    <Input
                                        id="icon"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        required
                                        placeholder="Code"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    required
                                    placeholder="Brief description of the service"
                                />
                            </div>

                            <div>
                                <Label htmlFor="features">Features (one per line)</Label>
                                <Textarea
                                    id="features"
                                    value={formData.features.join("\n")}
                                    onChange={(e) => handleFeaturesChange(e.target.value)}
                                    rows={5}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sortOrder">Sort Order</Label>
                                    <Input
                                        id="sortOrder"
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch
                                        id="status"
                                        checked={formData.status === "active"}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, status: checked ? "active" : "inactive" })
                                        }
                                    />
                                    <Label htmlFor="status">Active</Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false)
                                        resetForm()
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>{editingService ? "Update" : "Create"} Service</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <motion.div
                        key={service._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                                            <Settings className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{service.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={service.status === "active" ? "default" : "secondary"}>
                                                    {service.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Order: {service.sortOrder}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{service.description}</p>

                                {service.features.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-medium mb-1">Features:</p>
                                        <ul className="text-xs text-foreground/60 space-y-1">
                                            {service.features.slice(0, 3).map((feature, idx) => (
                                                <li key={idx} className="line-clamp-1">
                                                    • {feature}
                                                </li>
                                            ))}
                                            {service.features.length > 3 && (
                                                <li className="text-muted-foreground">+{service.features.length - 3} more</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(service._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(service.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {services.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Settings className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No services found</h3>
                        <p className="text-foreground/60 mb-4">Get started by creating your first service</p>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Service
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
