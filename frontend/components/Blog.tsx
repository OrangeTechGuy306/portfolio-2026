"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "Building Scalable React Applications with Next.js 14",
      excerpt:
        "Learn how to leverage the latest features in Next.js 14 to build performant and scalable React applications with server components and improved routing.",
      image: "/placeholder.svg?height=300&width=400",
      category: "React",
      readTime: "8 min read",
      publishDate: "2024-01-15",
      tags: ["Next.js", "React", "Performance"],
    },
    {
      id: 2,
      title: "The Future of Web Development: AI-Powered Tools",
      excerpt:
        "Exploring how artificial intelligence is revolutionizing web development workflows and the tools that are changing how we build applications.",
      image: "/placeholder.svg?height=300&width=400",
      category: "AI",
      readTime: "6 min read",
      publishDate: "2024-01-10",
      tags: ["AI", "Tools", "Future"],
    },
    {
      id: 3,
      title: "Mastering TypeScript: Advanced Patterns and Best Practices",
      excerpt:
        "Deep dive into advanced TypeScript patterns, utility types, and best practices for building type-safe applications at scale.",
      image: "/placeholder.svg?height=300&width=400",
      category: "TypeScript",
      readTime: "12 min read",
      publishDate: "2024-01-05",
      tags: ["TypeScript", "Best Practices", "Advanced"],
    },
    {
      id: 4,
      title: "Optimizing Web Performance: A Complete Guide",
      excerpt:
        "Comprehensive guide to web performance optimization covering everything from image optimization to code splitting and caching strategies.",
      image: "/placeholder.svg?height=300&width=400",
      category: "Performance",
      readTime: "10 min read",
      publishDate: "2023-12-28",
      tags: ["Performance", "Optimization", "Web"],
    },
  ]

  return (
    <section id="blog" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Latest <span className="gradient-text">Blog Posts</span>
          </h2>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            Sharing insights, tutorials, and thoughts on web development
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="fade-in"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group gradient-border h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500">{post.category}</Badge>
                  </div>
                </div>

                <CardHeader className="relative z-10">
                  <div className="flex items-center text-sm text-foreground/60 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors duration-300">
                    {post.title}
                  </h3>
                </CardHeader>

                <CardContent className="relative z-10">
                  <p className="text-foreground/70 mb-4 leading-relaxed">{post.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <div key={tag} className="flex items-center text-xs text-foreground/60">
                        <Tag className="w-3 h-3 mr-1" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-orange-500 hover:text-orange-600 group-hover:translate-x-2 transition-transform duration-300"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
          >
            View All Posts
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
