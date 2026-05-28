import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/contexts/ThemeContext'
import RouteProgress from '@/components/system/RouteProgress'
import PageTransition from '@/components/system/PageTransition'
import { WhatsAppSupport } from '@/components/ui/WhatsAppSupport'
import Footer from '@/components/Footer'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'DespaFacil - Sistema de Gestão',
  description: 'Sistema para gestão de motoristas e documentos',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${poppins.className} min-h-screen flex flex-col`}> 
        {/* Faixa superior com cor da marca (azul) */}
        <div className="w-full h-1.5 bg-brand-blue dark:bg-brand-blue" />
        <main className="flex-1">
          <ThemeProvider>
            <TooltipProvider delayDuration={200} skipDelayDuration={0}>
              <Suspense>
                <RouteProgress />
              </Suspense>
              <ToastProvider>
                <PageTransition>
                  {children}
                </PageTransition>
              </ToastProvider>
            </TooltipProvider>
          </ThemeProvider>
        </main>
        {/* Botão flutuante de suporte WhatsApp em todas as páginas */}
        <WhatsAppSupport />
        <Footer />
        {/* Sistema de Toast Notifications */}
        <Toaster 
          position="top-right" 
          expand={true}
          richColors 
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'var(--font-poppins)',
            },
          }}
        />
      </body>
    </html>
  )
}
