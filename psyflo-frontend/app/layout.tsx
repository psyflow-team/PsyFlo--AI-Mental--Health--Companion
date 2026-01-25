import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'Psyflo - AI Mental Health Companion',
  description: 'Your 24/7 AI-powered mental health companion for mood tracking, personalized wellness recommendations, and mental health support.',
  keywords: ['mental health', 'wellness', 'mood tracking', 'AI companion', 'meditation', 'stress management'],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8f4f8' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2332' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
