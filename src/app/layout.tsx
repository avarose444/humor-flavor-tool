import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'FlavorForge — Humor Prompt Chain Tool',
  description: 'Create and manage humor flavors and caption prompt chains.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Inline script to avoid flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t=localStorage.getItem('theme');
            var dark = t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
            if(dark) document.documentElement.classList.add('dark');
          })()
        `}} />
      </head>
      <body className="font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased min-h-screen">
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
