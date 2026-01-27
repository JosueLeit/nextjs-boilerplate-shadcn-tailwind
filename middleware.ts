import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar se o usuário está autenticado pela API
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only trust the Supabase session, not manual cookies
  const isAuthenticated = !!session

  // Rotas públicas - permitem acesso mesmo sem autenticação
  const publicRoutes = ['/login', '/register', '/reset-password', '/update-password', '/api', '/share']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isHomePage = req.nextUrl.pathname === '/'

  // Rota de onboarding - requer autenticação mas não requer onboarding completo
  const isOnboardingRoute = req.nextUrl.pathname.startsWith('/onboarding')

  // Se não está autenticado e a rota não é pública e não é home, redirecionar para login
  if (!isAuthenticated && !isPublicRoute && !isHomePage) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está autenticado e tenta acessar rotas públicas (exceto share e home), redirecionar para home
  if (isAuthenticated && isPublicRoute && !req.nextUrl.pathname.startsWith('/share')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Verificar onboarding apenas para usuários autenticados em rotas protegidas (não onboarding)
  if (isAuthenticated && session?.user && !isOnboardingRoute && !isPublicRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      // Se onboarding não foi completado, redirecionar para onboarding
      if (profile && profile.onboarding_completed === false) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
    } catch (error) {
      // Se houver erro ao buscar perfil, permitir acesso (pode ser perfil novo)
      console.log('[MIDDLEWARE] Erro ao verificar onboarding:', error)
    }
  }

  // Se está no onboarding mas já completou, redirecionar para home
  if (isAuthenticated && session?.user && isOnboardingRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (profile && profile.onboarding_completed === true) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.log('[MIDDLEWARE] Erro ao verificar onboarding:', error)
    }
  }

  // Adicionar headers úteis para debugging
  res.headers.set('x-auth-status', isAuthenticated ? 'authenticated' : 'unauthenticated')

  return res
}

// Configurar quais rotas devem passar pelo middleware, excluindo arquivos estáticos
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
} 