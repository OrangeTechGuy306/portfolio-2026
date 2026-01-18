"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Github, X, Loader2 } from "lucide-react"
import Image from "next/image"
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
            const uniqueCategories = [...new Set(result.data.portfolios.map((p: any) => p.category as string))] as string[]
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
      title: "TripMusee - Real Estate",
      category: "Real Estate",
      description: "A comprehensive real estate platform for property search and management.",
      longDescription: "Built with Next.js and high-performance technologies, TripMusee offers a seamless experience for finding and managing real estate properties globally.",
      image: "/Screenshot 2026-01-18 at 1.22.50 PM.png",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      liveUrl: "https://tripmusee.com/",
      githubUrl: "https://github.com/orangetechguy306",
      featured: true,
    },
    {
      id: 2,
      title: "Amma Couture - Fashion",
      category: "Fashion Design",
      description: "A premium fashion design and e-commerce showcase.",
      longDescription: "Experience the world of high-end fashion with Amma Couture, featuring creative designs and a smooth shopping experience built with modern web tools.",
      image: "/Screenshot 2026-01-18 at 1.23.17 PM.png",
      technologies: ["React", "Custom CSS", "Node.js", "MongoDB"],
      liveUrl: "https://ammacouture.com/",
      githubUrl: "https://github.com/orangetechguy306",
      featured: false,
    },
    {
      id: 3,
      title: "EnlightMeEdu - Consultancy",
      category: "Education",
      description: "Educational consultancy platform for global student guidance.",
      longDescription: "EnlightMeEdu provides expert guidance for students seeking international education, featuring an interactive platform built with React and Next.js.",
      image: "/Screenshot 2026-01-18 at 1.23.42 PM.png",
      technologies: ["Next.js", "Tailwind CSS", "Framer Motion"],
      liveUrl: "https://www.enlightmeedu.com/",
      githubUrl: "https://github.com/orangetechguy306",
      featured: true,
    },
    {
      id: 4,
      title: "TelescopeHR - SaaS",
      category: "HR System",
      description: "Enterprise HR management platform with secure data handling.",
      longDescription: "Telescope's use and transfer to any other app of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements. TelescopeHR does not share any user data with third-party tools, including AI models.",
      image: "/Screenshot 2026-01-18 at 1.34.07 PM.png",
      technologies: ["Next.js", "Google APIs", "Prisma", "Auth.js"],
      liveUrl: "https://telescope-orcin.vercel.app/",
      githubUrl: "https://github.com/orangetechguy306",
      featured: true,
    },
    {
      id: 5,
      title: "Waybox App - Music App",
      category: "Mobile App",
      description: "Cross-platform mobile music application for high-quality audio streaming.",
      longDescription: "Waybox brings a rich music experience to your fingertips, optimized for performance and built with React Native and robust backend services.",
      image: "/Screenshot 2026-01-18 at 1.34.41 PM.png",
      technologies: ["React Native", "Audio Streaming", "Node.js", "MongoDB"],
      liveUrl: "https://play.google.com/store/apps/details?id=com.westshoresolutions.wayboxapp",
      githubUrl: "https://github.com/orangetechguy306",
      featured: true,
    },
    {
      id: 6,
      title: "Goshen Realm - Ecommerce",
      category: "Mobile App",
      description: "A feature-rich e-commerce mobile application built with React Native.",
      longDescription: "Experience seamless mobile shopping with Goshen Realm, a high-performance cross-platform application developed for both iOS and Android users.",
      image: "/Screenshot 2026-01-18 at 1.34.58 PM.png",
      technologies: ["React Native", "Redux", "Express.js", "Firebase"],
      liveUrl: "https://play.google.com/store/apps/details?id=com.unitech.goshenrealm",
      githubUrl: "https://github.com/orangetechguy306",
      featured: false,
    },
    {
      id: 7,
      title: "M4 Solutions - Graphics",
      category: "Graphics & Print",
      description: "Official portal for a graphics design and printing press industry.",
      longDescription: "M4 Solutions showcases the best in creative design and high-quality printing services, providing a modern web presence for a leading industry player.",
      image: "/Screenshot 2026-01-18 at 1.37.54 PM.png",
      technologies: ["HTML5", "CSS3", "JavaScript", "GitHub Pages"],
      liveUrl: "https://haqqtech001.github.io/m4-solutions-website/",
      githubUrl: "https://github.com/haqqtech001/m4-solutions-website",
      featured: false,
    },
    {
      id: 8,
      title: "Al Mahbub - Procurement",
      category: "Procurement",
      description: "International procurement and supply chain management platform.",
      longDescription: "A robust platform for international trade and procurement, streamlining supply chain processes and ensuring secure transactions.",
      image: "/Screenshot 2026-01-18 at 1.38.09 PM.png",
      technologies: ["Next.js", "Tailwind CSS", "Directus CMS", "PostgreSQL"],
      liveUrl: "https://www.almahbubinternational.com/",
      githubUrl: "https://github.com/orangetechguy306",
      featured: true,
    },
  ]

  // Use API data if available, otherwise fallback to demo data
  const displayProjects = projects.length > 0 ? projects : (fallbackProjects as any as PortfolioType[])
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
                  <div className="relative overflow-hidden aspect-video">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                <div className="relative aspect-video">
                  <Image
                    src={selectedProject.image || "/placeholder.svg"}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1024px"
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
