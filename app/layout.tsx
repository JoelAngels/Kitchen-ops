import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

import "./globals.css"
import { MotionProvider } from "@/components/motion/motion-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Brand typeface. Variable font with optical sizing, so headings and small UI text each get tuned letterforms.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  axes: ["opsz", "wdth"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// viewportFit "cover" lets iOS report safe-area insets (home indicator, notch) to CSS.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
}

export const metadata: Metadata = {
  title: { default: "Tamu", template: "%s · Tamu" },
  description: "Restaurant POS and operations for Tasty Grubs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", bricolage.variable)}
    >
      <body>
        <ThemeProvider>
          <MotionProvider>
            <TooltipProvider delay={300}>
              {children}
              <Toaster
                position="bottom-right"
                richColors
                offset={{ bottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
                mobileOffset={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
              />
            </TooltipProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
