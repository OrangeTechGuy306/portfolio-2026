"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"

export default function Skills() {
  const skillsRef = useRef<HTMLDivElement>(null)

  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        { name: "React/Next.js", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "Tailwind CSS", level: 92 },
        { name: "Vue.js", level: 85 },
        { name: "GSAP/Framer Motion", level: 88 },
      ],
    },
    {
      title: "Backend",
      skills: [
        { name: "Node.js", level: 90 },
        { name: "Python", level: 85 },
        { name: "PostgreSQL", level: 88 },
        { name: "MongoDB", level: 82 },
        { name: "GraphQL", level: 80 },
      ],
    },
    {
      title: "Tools & Others",
      skills: [
        { name: "AWS/Vercel", level: 87 },
        { name: "Docker", level: 83 },
        { name: "Git/GitHub", level: 95 },
        { name: "Figma", level: 78 },
        { name: "Testing (Jest)", level: 85 },
      ],
    },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate skill bars when they come into view
      gsap.fromTo(
        ".skill-bar",
        { width: 0 },
        {
          width: (i, target) => target.getAttribute("data-width") + "%",
          duration: 1.5,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".skills-container",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, skillsRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="skills" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            My <span className="gradient-text">Skills</span>
          </h2>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            Technologies and tools I use to bring ideas to life
          </p>
        </motion.div>

        <div ref={skillsRef} className="skills-container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
              className="fade-in"
            >
              <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 gradient-border">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-6 gradient-text">{category.title}</h3>

                  <div className="space-y-6">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skill.name} className="skill-item">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <span className="text-sm text-foreground/60">{skill.level}%</span>
                        </div>

                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="skill-bar absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                            data-width={skill.level}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Skills Cloud */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8">
            Additional <span className="gradient-text">Technologies</span>
          </h3>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Redux",
              "Zustand",
              "Prisma",
              "Supabase",
              "Firebase",
              "Stripe",
              "Socket.io",
              "WebRTC",
              "Three.js",
              "D3.js",
              "Electron",
              "React Native",
            ].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full text-sm font-medium hover:bg-orange-500/20 transition-colors duration-200 cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
