import NextAuth from "next-auth"
import authConfig from "@/server/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]
const authRoutes = ["/login", "/register"]
const organizerRoutes = ["/dashboard"]
const adminRoutes = ["/admin"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const pathname = nextUrl.pathname

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isOrganizerRoute = organizerRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isApiRoute = pathname.startsWith("/api")

  // Allow API routes
  if (isApiRoute) return NextResponse.next()

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  // Redirect to login for protected routes
  if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    )
  }

  // Check organizer routes
  if (isOrganizerRoute && isLoggedIn) {
    const role = req.auth?.user?.role
    if (role !== "ORGANIZER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  // Check admin routes
  if (isAdminRoute && isLoggedIn) {
    const role = req.auth?.user?.role
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
}
