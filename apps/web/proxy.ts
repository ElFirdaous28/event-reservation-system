export const config = {
    matcher: [
        '/admin/:path*',
        '/participant/:path*',
        '/profile/:path*',
        '/login',
        '/register'
    ],
};

export async function proxy(request: Request) {
    const url = new URL(request.url);
    const cookieHeader = request.headers.get('cookie') || '';
    const hasRefreshToken = cookieHeader.includes('refreshToken');

    const isProtectedRoute =
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/participant') ||
        url.pathname.startsWith('/profile');

    if (isProtectedRoute && !hasRefreshToken) {
        return Response.redirect(new URL('/login', request.url), 307);
    }

    const isAuthRoute = url.pathname === '/login' || url.pathname === '/register';

    if (isAuthRoute && hasRefreshToken) {
        // Redirect to their respective dashboard based on logic or a default
        return Response.redirect(new URL('/admin/events', request.url), 307);
    }

    return;
}