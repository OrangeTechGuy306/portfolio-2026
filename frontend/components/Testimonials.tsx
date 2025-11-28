"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      company: "TechStart Inc.",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "John delivered an exceptional e-commerce platform that exceeded our expectations. His attention to detail and technical expertise helped us increase our online sales by 200%. Highly recommended!",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Product Manager",
      company: "Digital Solutions",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "Working with John was a game-changer for our project. He not only delivered high-quality code but also provided valuable insights that improved our overall product strategy.",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "Creative Agency",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "The landing page John created for our campaign generated a 150% increase in conversions. His understanding of both technical and business requirements is outstanding.",
      rating: 5,
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Startup Founder",
      company: "InnovateLab",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "John helped us build our MVP from scratch. His full-stack expertise and ability to work under tight deadlines made our product launch a success. Couldn't ask for a better developer!",
      rating: 5,
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "CTO",
      company: "FinTech Solutions",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "John's expertise in modern web technologies and his problem-solving skills are exceptional. He delivered a complex financial dashboard that our team and clients love.",
      rating: 5,
    },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
  }

  // Auto-advance testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Client <span className="gradient-text">Testimonials</span>
          </h2>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">What my clients say about working with me</p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="gradient-border">
                <CardContent className="relative z-10 p-8 md:p-12">
                  <Quote className="w-12 h-12 text-orange-500 mb-6 mx-auto" />

                  <blockquote className="text-lg md:text-xl text-center text-foreground/80 leading-relaxed mb-8">
                    "{testimonials[currentIndex].content}"
                  </blockquote>

                  <div className="flex items-center justify-center mb-6">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-orange-500 fill-current" />
                    ))}
                  </div>

                  <div className="flex items-center justify-center">
                    <img
                      src={testimonials[currentIndex].image || "/placeholder.svg"}
                      alt={testimonials[currentIndex].name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div className="text-center">
                      <h4 className="font-bold text-lg">{testimonials[currentIndex].name}</h4>
                      <p className="text-foreground/60">{testimonials[currentIndex].role}</p>
                      <p className="text-orange-500 text-sm">{testimonials[currentIndex].company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? "bg-orange-500" : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
