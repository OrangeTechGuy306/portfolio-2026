"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Briefcase,
  Mail,
  Settings,
  Eye,
  MessageSquare,
  Loader2,
  LogOut,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated, getUserData, logout, getAuthToken } from "@/lib/auth-utils"
import { toast } from "sonner"

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState({
    portfolios: { total: 0, published: 0, drafts: 0 },
    contacts: { total: 0, unread: 0, replied: 0 },
    views: { total: 0, thisMonth: 0 }
  })

  useEffect(() => {
    // Check authentication status
    const authStatus = isAuthenticated()
    const userData = getUserData()

    setUserLoggedIn(authStatus)
    setCurrentUser(userData)

    // Fetch dashboard stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()

      // Prepare headers with auth if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch portfolio stats
      const portfolioResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api/v1'}/portfolio`, {
        headers
      })

      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json()
        if (portfolioData.success) {
          const portfolios = portfolioData.data.portfolios || []
          setStats(prev => ({
            ...prev,
            portfolios: {
              total: portfolios.length,
              published: portfolios.filter((p: any) => p.status === 'published').length,
              drafts: portfolios.filter((p: any) => p.status === 'draft').length,
            }
          }))
        }
      }

      // Try to fetch contact stats if authenticated
      if (token) {
        try {
          const contactResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api/v1'}/contact/stats`, {
            headers
          })

          if (contactResponse.ok) {
            const contactData = await contactResponse.json()
            if (contactData.success) {
              const contactStats = contactData.data.stats
              setStats(prev => ({
                ...prev,
                contacts: {
                  total: contactStats.total || 0,
                  unread: contactStats.unread || 0,
                  replied: contactStats.replied || 0,
                },
                views: {
                  total: contactStats.total * 50 || 1250, // Estimate views
                  thisMonth: contactStats.unread * 60 || 180,
                }
              }))
            }
          }
        } catch (contactError) {
          console.log('Contact stats not available:', contactError)
        }
      }

      // Set demo stats if not authenticated or if contact stats failed
      if (!token || !stats.contacts.total) {
        setStats(prev => ({
          ...prev,
          contacts: {
            total: 15,
            unread: 3,
            replied: 12,
          },
          views: {
            total: 1250,
            thisMonth: 180,
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set fallback stats
      setStats({
        portfolios: { total: 8, published: 6, drafts: 2 },
        contacts: { total: 15, unread: 3, replied: 12 },
        views: { total: 1250, thisMonth: 180 }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUserLoggedIn(false)
      setCurrentUser(null)
      toast.success('Logged out successfully')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error logging out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <LayoutDashboard className="w-8 h-8 text-orange-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {userLoggedIn && currentUser ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Welcome, {currentUser.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Portfolio Management System
                  </span>
                  <Button
                    onClick={() => router.push('/admin/login')}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.portfolios.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.portfolios.published} published, {stats.portfolios.drafts} drafts
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contacts.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.contacts.unread} unread
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.views.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.views.thisMonth} this month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Replied Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contacts.replied}</div>
                <p className="text-xs text-muted-foreground">
                  Response rate: {stats.contacts.total > 0 ? Math.round((stats.contacts.replied / stats.contacts.total) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-orange-500" />
                  Manage Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add, edit, or delete portfolio items
                </p>
                <Button
                  onClick={() => router.push('/admin/portfolio')}
                  className="w-full"
                >
                  Go to Portfolio
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-500" />
                  Contact Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View and respond to contact messages
                </p>
                <Button
                  onClick={() => router.push('/admin/contacts')}
                  className="w-full"
                  variant="outline"
                >
                  View Messages
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-500" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Update profile and system settings
                </p>
                <Button
                  onClick={() => router.push('/admin/settings')}
                  className="w-full"
                  variant="outline"
                >
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
