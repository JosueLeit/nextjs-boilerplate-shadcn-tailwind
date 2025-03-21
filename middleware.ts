import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Criar um cliente Supabase para o middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas públicas - permitem acesso mesmo sem autenticação
  const publicRoutes = ['/login', '/register', '/reset-password', '/api']

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Log para debug (remover em produção)
  console.log('Middleware: Path:', req.nextUrl.pathname, 'Session:', !!session, 'Public:', isPublicRoute);

  // Se não há sessão e a rota não é pública, redirecionar para login
  if (!session && !isPublicRoute) {
    console.log('Redirecionando para login:', req.nextUrl.pathname);
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se há sessão e o usuário está tentando acessar login/register, redirecionar para home
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    console.log('Usuário já autenticado, redirecionando para home');
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Atualizar o cabeçalho com o token de autenticação se disponível
  if (session) {
    res.headers.set('x-user-id', session.user.id);
  }

  return res
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
} 