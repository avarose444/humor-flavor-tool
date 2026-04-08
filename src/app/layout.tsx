import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'FlavorForge',
  description: 'Humor flavor prompt chain tool.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t = localStorage.getItem('theme');
            var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (dark) document.documentElement.classList.add('dark');
          })()
        `}} />
      </head>
      <body className="bg-[#fdf6f0] dark:bg-[#1a1015] text-[#1a1015] dark:text-[#f7e7ce] antialiased min-h-screen transition-colors duration-300">
        <canvas id="confetti-canvas" />
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-8">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}