import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/server/db"
import authConfig from "@/server/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as "STUDENT" | "ORGANIZER" | "ADMIN"
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role
      }
      if (!token.role) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      return token
    },
  },
  ...authConfig,
})
