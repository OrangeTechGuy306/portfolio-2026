"use client"

import { motion } from "framer-motion"
import { Heart, ArrowUp, Github, Linkedin, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <motion.div whileHover={{ scale: 1.05 }} className="text-3xl font-bold gradient-text mb-4">
              Hanafi Taofiq
            </motion.div>
            <p className="text-foreground/60 leading-relaxed mb-6">
              Full Stack Developer passionate about creating exceptional digital experiences through innovative web
              solutions.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Github, href: "https://github.com/orangetechguy306", label: "GitHub" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/hanafi-taofiq-b6345a229", label: "LinkedIn" },
                { icon: Twitter, href: "https://x.com/OrangeTechguy", label: "Twitter" },
                { icon: Mail, href: "mailto:hanafitaofiq95@gmail.com", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-foreground/5 hover:bg-orange-500/20 text-foreground/60 hover:text-orange-500 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {["About", "Services", "Portfolio", "Blog", "Contact"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-foreground/60 hover:text-orange-500 transition-colors duration-200"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <div className="space-y-2">
              {["Web Development", "Mobile Apps", "UI/UX Design", "Consulting", "Maintenance"].map((service) => (
                <div key={service} className="text-foreground/60">
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="flex items-center text-foreground/60 mb-4 md:mb-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 mx-2 text-red-500 fill-current" />
            <span>by Hanafi Taofiq {currentYear}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </footer>
  )
}
