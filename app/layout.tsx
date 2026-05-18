import React from "react"
import type { Metadata, Viewport } from 'next'
import { Nunito, Josefin_Sans, Space_Mono } from 'next/font/google'

import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/app/shop/cart-context"
import { GlobalChrome } from "@/components/layout/GlobalChrome"
import './globals.css'

/**
 * Nunito — primary UI font.
 * Closest freely available equivalent to Century Gothic:
 * geometric, rounded, clean and modern per Love Island brand guidelines.
 */
const _nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
})

/**
 * Josefin Sans — display/heading font.
 * The brand spec names this as the logo typeface. On the web it is used
 * for large headings and the site wordmark to echo the show's identity.
 */
const _josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  weight: ['400', '600', '700'],
  display: 'swap',
})

const _spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Love Island Nigeria - Find Your Connection',
  description:
    'The official home of Love Island Nigeria. Meet the islanders, watch exclusive clips, and apply to be on the hottest reality dating show in Nigeria.',
}

export const viewport: Viewport = {
  themeColor: '#FF36A0',  /* Love Island Magenta */
  /** Enables env(safe-area-inset-*) for fixed footers (e.g. vote CTA on notched phones). */
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${_nunito.variable} ${_josefinSans.variable} ${_spaceMono.variable} font-sans antialiased`}
      >
        <CartProvider>
          <GlobalChrome>{children}</GlobalChrome>
        </CartProvider>
        <Toaster />
      </body>
    </html>
  )
}
