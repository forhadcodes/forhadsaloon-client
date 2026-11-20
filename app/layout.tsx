import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Toaster as HotToaster } from "react-hot-toast"

import "./globals.css"
import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { SITE } from "@/lib/constants"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Salon Appointment Booking`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-theme="salon"
      suppressHydrationWarning
      className={cn("antialiased", inter.variable, playfair.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider forcedTheme="light">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <HotToaster position="top-center" />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
