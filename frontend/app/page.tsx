"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import About from "@/components/About"
import Services from "@/components/Services"
import Portfolio from "@/components/Portfolio"

const Experience = dynamic(() => import("@/components/Experience"), { ssr: false })
const Skills = dynamic(() => import("@/components/Skills"), { ssr: false })
const Blog = dynamic(() => import("@/components/Blog"), { ssr: false })
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false })
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false })

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useEffect(() => {
    // GSAP ScrollTrigger animations
    gsap.fromTo(
      ".fade-in",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".fade-in",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      },
    )

    // Parallax effect for hero section
    gsap.to(".parallax-bg", {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".parallax-bg",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    })
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Experience />
      <Skills />
      {/* <Testimonials /> */}
      <Blog />
      <Contact />
      <Footer />
    </main>
  )
}
