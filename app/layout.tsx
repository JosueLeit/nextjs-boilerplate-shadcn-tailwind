import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FavoritePerson.app - Sua história de amor em uma linha do tempo',
  description: 'Um mural digital para casais compartilharem momentos especiais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        {/* Script para verificar o estado de autenticação no carregamento da página */}
        <script 
          dangerouslySetInnerHTML={{ 
            __html: `
              try {
                console.log('[AUTH] Verificando estado de autenticação na inicialização');
                const hasSession = document.cookie.includes('sb-access-token');
                const pathname = window.location.pathname;
                console.log('[AUTH] Estado inicial:', { hasSession, pathname });
              } catch (e) {
                console.error('[AUTH] Erro ao verificar estado inicial:', e);
              }
            ` 
          }} 
        />
      </body>
    </html>
  )
}
