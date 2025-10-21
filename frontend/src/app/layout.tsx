import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
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
      </head>
      <body className={`${poppins.className} min-h-screen flex flex-col`}> 
        {/* Faixa superior com cor da marca */}
        <div className="w-full h-1.5 bg-brand" />
        <main className="flex-1">
          <ToastProvider>        
            {children}
          </ToastProvider>
        </main>
        {/* Botão flutuante de suporte WhatsApp em todas as páginas */}
        <WhatsAppSupport />
        <Footer />
      </body>
    </html>
  )
}
