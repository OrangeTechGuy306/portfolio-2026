"use client"

import { motion } from "framer-motion"
import { Code, Coffee, Users, Award, House } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function About() {
  const stats = [
    { icon: Code, label: "Projects Completed", value: "15+" },
    { icon: House, label: "Company works with", value: "5+" },
    { icon: Users, label: "Happy Clients", value: "10+" },
    { icon: Award, label: "Successful students", value: "200+" },
  ]

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            Passionate developer with 8+ years of experience creating digital solutions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="fade-in"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl transform rotate-6"></div>
              <img
                src="/author.jpg"
                alt="HT"
                className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="fade-in space-y-6"
          >
            <h3 className="text-3xl font-bold">
              I'm a <span className="gradient-text">Creative Engineer</span>
            </h3>
            <p className="text-lg text-foreground/70 leading-relaxed">
              With a passion for creating exceptional digital experiences, I specialize in full-stack development using
              modern technologies. My journey began 9 years ago, and since then, I've been dedicated to crafting
              solutions that not only meet technical requirements but also provide outstanding user experiences.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              I believe in the power of clean code, innovative design, and collaborative teamwork. When I'm not coding,
              you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge
              with the developer community.
            </p>
            <div className="flex flex-wrap gap-4">
              {["React", "Next.js", "TypeScript", "Node.js", "Python", "AWS"].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 gradient-border">
                <CardContent className="relative z-10">
                  <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-foreground/60">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
