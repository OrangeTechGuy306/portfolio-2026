"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Github, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { portfolioService } from "@/lib/api-services"
import { Portfolio as PortfolioType } from "@/lib/api"
import { toast } from "sonner"

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedProject, setSelectedProject] = useState<PortfolioType | null>(null)
  const [projects, setProjects] = useState<PortfolioType[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true)

        // Fetch portfolio items from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api/v1'}/portfolio?status=published&limit=50`)

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.portfolios) {
            setProjects(result.data.portfolios)

            // Extract unique categories
            const uniqueCategories = [...new Set(result.data.portfolios.map((p: any) => p.category))]
            setCategories(['All', ...uniqueCategories])
          }
        } else {
          console.log('API not available, using fallback data')
        }
      } catch (error) {
        console.log('API not available, using fallback data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [])

  // Fallback data for development/demo
  const fallbackProjects = [
    {
      id: 1,
      title: "E-commerce Platform",
      category: "E-commerce",
      description:
        "A full-featured e-commerce platform with payment integration, inventory management, and admin dashboard.",
      longDescription:
        "This comprehensive e-commerce platform was built using Next.js, TypeScript, and Stripe for payments. It features a modern design, real-time inventory tracking, order management, and a powerful admin dashboard. The platform handles thousands of products and processes hundreds of orders daily.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["Next.js", "TypeScript", "Stripe", "PostgreSQL", "Tailwind CSS"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      featured: true,
    },
    {
      id: 2,
      title: "Task Management App",
      category: "Web App",
      description:
        "A collaborative task management application with real-time updates and team collaboration features.",
      longDescription:
        "Built with React and Socket.io for real-time collaboration, this task management app allows teams to organize projects, assign tasks, and track progress. Features include drag-and-drop kanban boards, time tracking, file attachments, and detailed analytics.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Material-UI"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      featured: false,
    },
    {
      id: 3,
      title: "Fitness Tracking Mobile App",
      category: "Mobile App",
      description: "Cross-platform mobile app for fitness tracking with workout plans and progress monitoring.",
      longDescription:
        "A comprehensive fitness tracking application built with React Native. Users can log workouts, track progress, follow custom workout plans, and monitor their fitness journey. The app includes social features, achievement badges, and integration with wearable devices.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["React Native", "Firebase", "Redux", "Chart.js"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      featured: true,
    },
    {
      id: 4,
      title: "Restaurant Landing Page",
      category: "Landing Page",
      description: "Modern and responsive landing page for a high-end restaurant with online reservation system.",
      longDescription:
        "An elegant landing page designed for a luxury restaurant featuring smooth animations, an interactive menu, online reservation system, and integration with social media. The design emphasizes the restaurant's premium brand and creates an immersive dining experience preview.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["Next.js", "Framer Motion", "Tailwind CSS", "Sanity CMS"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      featured: false,
    },
    {
      id: 5,
      title: "Crypto Trading Dashboard",
      category: "Web App",
      description: "Real-time cryptocurrency trading dashboard with advanced charting and portfolio management.",
      longDescription:
        "A sophisticated trading dashboard that provides real-time cryptocurrency data, advanced charting tools, portfolio tracking, and trading signals. Built with modern web technologies to handle high-frequency data updates and provide a seamless trading experience.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["React", "D3.js", "WebSocket", "Node.js", "Redis"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      featured: true,
    },
    {
      id: 6,
      title: "Learning Management System",
      category: "Web App",
      description: "Comprehensive LMS platform for online education with course management and student tracking.",
      longDescription:
        "A full-featured learning management system that enables educators to create courses, manage students, track progress, and facilitate online learning. Includes video streaming, quiz systems, discussion forums, and detailed analytics for both instructors and students.",
      image: "/placeholder.svg?height=400&width=600",
      technologies: ["Next.js", "PostgreSQL", "AWS S3", "Stripe", "Socket.io"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      featured: false,
    },
  ]

  // Use API data if available, otherwise fallback to demo data
  const displayProjects = projects.length > 0 ? projects : fallbackProjects
  const filteredProjects =
    selectedCategory === "All"
      ? displayProjects
      : displayProjects.filter((project) => project.category === selectedCategory)

  return (
    <section id="portfolio" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            My <span className="gradient-text">Portfolio</span>
          </h2>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto mb-8">
            Showcasing my latest projects and creative solutions
          </p>

          {/* Category Filter */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-2 text-foreground/60">Loading portfolio...</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                      : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Projects Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="fade-in"
              >
                <Card
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group gradient-border"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="secondary">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Github className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {project.featured && <Badge className="absolute top-4 right-4 bg-orange-500">Featured</Badge>}
                  </div>
                  <CardContent className="relative z-10 p-6">
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-foreground/70 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedProject.image || "/placeholder.svg"}
                    alt={selectedProject.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setSelectedProject(null)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{selectedProject.title}</h3>
                      <Badge className="bg-orange-500">{selectedProject.category}</Badge>
                    </div>
                    <div className="flex space-x-4">
                      <Button asChild>
                        <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    </div>
                  </div>

                  <p className="text-foreground/70 text-lg leading-relaxed mb-6">{selectedProject.longDescription}</p>

                  <div>
                    <h4 className="text-xl font-semibold mb-4">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech: string) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
