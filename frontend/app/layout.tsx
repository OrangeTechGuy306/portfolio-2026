import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hanafi Taofiq - Software Engineer",
  description:
    "Professional portfolio of Hanafi Taofiq  , a passionate Software Engineer specializing in modern web and mobile technologies.",
  keywords: "developer, portfolio, react, nextjs, typescript, full-stack, software engineer, web developer, mobile developer,",
  authors: [{ name: "Hanafi Taofiq " }],
  openGraph: {
    title: "Hanafi Taofiq - Software Engineer",
    description: "Professional portfolio showcasing modern web development projects",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
