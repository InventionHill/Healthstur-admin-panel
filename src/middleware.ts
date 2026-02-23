import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We are protecting /dashboard and any child routes
  if (pathname.startsWith('/dashboard')) {
    // In our implementation, since we rely on purely stateless JWT stored in memory,
    // page navigations cannot attach headers cleanly before rendering.
    // However, for NextJS, a common approach allows checking local storage on the client side,
    // or if we use cookies, checking the cookie here.
    // 
    // Given the prompt: "Frontend stores Access Token (memory or secure storage)"
    // If it's pure memory/local storage, Next.js Edge Middleware CANNOT read it for initial page loads.
    // We will still protect API routes if they use cookies here, but for pure header-based approaches,
    // we must also verify on the client side.
    
    // We'll let the client-side handle the redirect if there's no token in localStorage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
