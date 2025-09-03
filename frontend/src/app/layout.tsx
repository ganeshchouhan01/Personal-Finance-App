// src/app/layout.js
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track your income and expenses with ease',
}

export default function RootLayout({ children }:any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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