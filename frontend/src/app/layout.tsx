// src/app/layout.js
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Toaster } from 'sonner'
import type { AppProps } from "next/app"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track your income and expenses with ease',
}

export default function RootLayout({ children }:any) {
  return (
    <html lang="en" className={`${inter.className}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right" 
              theme="system"
              toastOptions={{
                className: 'glass',
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}