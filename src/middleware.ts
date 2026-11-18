import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = (token as any)?.role;

    // Staff cannot access admin or mobile admin
    if ((path.startsWith("/admin") || path.startsWith("/mobile")) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/staff/dashboard", req.url));
    }

    // Admin accessing staff routes can be redirected to admin dashboard
    if (path.startsWith("/staff") && role !== "STAFF" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/login" || path.startsWith("/api/auth") || path.startsWith("/sample-docs")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/mobile/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|sample-docs).*)",
  ],
};
