import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname
        const role = token?.role

        // Redirect to login if accessing protected routes without correct role
        if (path.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
        if (path.startsWith("/doctor") && role !== "DOCTOR") {
            return NextResponse.redirect(new URL("/", req.url))
        }
        if (path.startsWith("/patient") && role !== "PATIENT") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to public routes
                const path = req.nextUrl.pathname;
                if (path === '/' || path.startsWith('/login') || path.startsWith('/register')) {
                    return true;
                }
                // Require token for protected routes
                return !!token;
            },
        },
    }
)

export const config = {
    matcher: [
        '/admin/:path*',
        '/doctor/:path*',
        '/patient/:path*',
    ]
}
