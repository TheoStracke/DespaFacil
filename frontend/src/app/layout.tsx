import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { WhatsAppSupport } from '@/components/ui/WhatsAppSupport'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DespaFacil - Sistema de Gestão',
  description: 'Sistema para gestão de motoristas e documentos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Faixa superior com cor da marca */}
        <div className="w-full h-1.5 bg-brand" />
        <ToastProvider>        
          {children}
        </ToastProvider>
        {/* Botão flutuante de suporte WhatsApp em todas as páginas */}
        <WhatsAppSupport />
        <Footer />
      </body>
    </html>
  )
}
