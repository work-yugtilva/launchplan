import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for Server Components to read auth state
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Protect /hub — redirect to /auth/login if no session
  if (path.startsWith('/hub') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in — redirect away from auth pages
  if ((path === '/auth/login' || path === '/auth/signup') && user) {
    const hubUrl = request.nextUrl.clone()
    hubUrl.pathname = '/hub/browse'
    hubUrl.search = ''
    return NextResponse.redirect(hubUrl)
  }

  return supabaseResponse
}

// Only refresh Supabase cookies on routes that use server-side auth. Running
// `getUser()` on every request (including `/`) adds an Auth round-trip and can
// stall the tab at "Untitled" / "Compiling /" if that request is slow or stuck.
export const config = {
  matcher: ['/hub/:path*', '/auth/:path*', '/api/agent', '/api/agent/:path*'],
}
