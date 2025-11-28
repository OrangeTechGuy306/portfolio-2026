"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ArrowDown, Github, Linkedin, Mail, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animated background particles
      gsap.set(".particle", {
        x: "random(-100, 100)",
        y: "random(-100, 100)",
        scale: "random(0.5, 1.5)",
      })

      gsap.to(".particle", {
        x: "random(-200, 200)",
        y: "random(-200, 200)",
        duration: "random(10, 20)",
        repeat: -1,
        yoyo: true,
        ease: "none",
      })

      // Text reveal animation
      gsap.fromTo(
        ".hero-text",
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
        },
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const socialLinks = [
    { icon: Github, href: "https://github.com/orangetechguy306", label: "GitHub" },
    { icon: Linkedin, href: "https:www.linkedin.com/in/hanafi-taofiq-b6345a229", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/OrangeTechguy", label: "Twitter" },
    { icon: Mail, href: "mailto:hanafitaofiq95@gmail.com", label: "Email" },
  ]

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 parallax-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10" />
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-orange-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div ref={textRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <div className="hero-text mb-4">
            <span className="text-orange-500 text-lg font-medium">Hello, I'm</span>
          </div>

          <h1 className="hero-text text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Hanafi Taofiq</span>
          </h1>

          <div className="hero-text text-2xl md:text-4xl font-light mb-8 text-foreground/80">
            <span className="typing-animation">Software Engineer</span>
          </div>

          <p className="hero-text text-lg md:text-xl text-foreground/60 mb-12 max-w-3xl mx-auto leading-relaxed">
            I craft exceptional digital experiences through innovative web solutions, combining cutting-edge technology
            with creative design to bring ideas to life.
          </p>

          <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-8 py-3 text-lg pulse-orange"
            >
              View My Work
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg bg-transparent"
            >
              Get In Touch
            </Button>
          </div>

          <div className="hero-text flex justify-center space-x-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-foreground/5 hover:bg-orange-500/20 transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6 text-foreground/60 hover:text-orange-500" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ArrowDown className="w-6 h-6 text-orange-500" />
        </motion.div>
      </div>
    </section>
  )
}
