import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Criar um cliente Supabase para o middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar se o usuário está autenticado pela API
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Verificar também tokens nos cookies
  const cookieValues = Object.fromEntries(
    req.cookies.getAll().map(cookie => [cookie.name, cookie.value])
  );
  const hasAccessTokenCookie = 
    cookieValues['sb-access-token'] !== undefined || 
    cookieValues['supabase-auth-token'] !== undefined;
  
  // Para depuração, listar alguns cookies
  console.log('Cookies detectados:', Object.keys(cookieValues).join(', '));

  // Considerar autenticado se tiver sessão OU token nos cookies
  const isAuthenticated = !!session || hasAccessTokenCookie;

  // Para debug, registrar informações de requisição nos headers
  res.headers.set('x-middleware-cache', 'no-cache')
  res.headers.set('x-middleware-timestamp', Date.now().toString())
  res.headers.set('x-is-authenticated', isAuthenticated ? 'true' : 'false')

  // Rotas públicas - permitem acesso mesmo sem autenticação
  const publicRoutes = ['/login', '/register', '/reset-password', '/api']

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  
  // Debug: registrar detalhes sobre a requisição e sessão
  console.log('----- MIDDLEWARE -----')
  console.log('Path:', req.nextUrl.pathname)
  console.log('Método:', req.method)
  console.log('Session API:', session ? `Autenticado (${session.user.email})` : 'Não autenticado')
  console.log('Cookie Auth:', hasAccessTokenCookie ? 'Token encontrado' : 'Sem token')
  console.log('Autenticado?', isAuthenticated)
  console.log('Public Route:', isPublicRoute)
  console.log('----------------------')
  
  // Se não está autenticado e a rota não é pública, redirecionar para login
  if (!isAuthenticated && !isPublicRoute) {
    console.log('Middleware: Redirecionando para login:', req.nextUrl.pathname)
    
    // Guardar a URL original para redirecionamento posterior
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    
    return NextResponse.redirect(redirectUrl)
  }

  // Se está autenticado e o usuário está tentando acessar login/register, redirecionar para home
  if (isAuthenticated && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    console.log('Middleware: Usuário já autenticado, redirecionando para home')
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Atualizar os cabeçalhos com informações do usuário se estiver autenticado
  if (session) {
    res.headers.set('x-user-id', session.user.id)
    res.headers.set('x-user-email', session.user.email || '')
    res.headers.set('x-session-active', 'true')
  } else if (hasAccessTokenCookie) {
    res.headers.set('x-session-active', 'true')
    res.headers.set('x-session-via-cookie', 'true')
  } else {
    res.headers.set('x-session-active', 'false')
  }

  return res
}

// Configurar quais rotas devem passar pelo middleware, excluindo arquivos estáticos
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
} 