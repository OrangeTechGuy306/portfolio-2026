// GSAP Setup Script
// This script demonstrates how to set up GSAP with ScrollTrigger for advanced animations

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Initialize GSAP animations
export function initializeGSAP() {
  // Set default ease
  gsap.defaults({ ease: "power2.out", duration: 1 })

  // Create a timeline for page load animations
  const tl = gsap.timeline()

  // Animate elements on page load
  tl.from(".hero-text", {
    y: 100,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
  })

  // Parallax scrolling effect
  gsap.utils.toArray(".parallax-element").forEach((element) => {
    gsap.to(element, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    })
  })

  // Fade in animations for sections
  gsap.utils.toArray(".fade-in").forEach((element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      },
    )
  })

  // Skill bar animations
  gsap.utils.toArray(".skill-bar").forEach((bar) => {
    gsap.fromTo(
      bar,
      { width: 0 },
      {
        width: bar.getAttribute("data-width") + "%",
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bar,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    )
  })

  console.log("GSAP animations initialized successfully!")
}

// Call the initialization function
initializeGSAP()
