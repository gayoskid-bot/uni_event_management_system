import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/server/db"
import authConfig from "@/server/auth.config"
import { loginSchema } from "@/lib/validations/auth.schema"

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) return null

        const { email, password } = validated.data

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.hashedPassword) return null

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        } as Record<string, unknown>
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
        session.user.name = (token.name as string | null) ?? null
        session.user.image = (token.picture as string | null) ?? null
        session.user.onboardingCompleted = Boolean(token.onboardingCompleted)
      }
      return session
    },
    async jwt({ token, user }) {
      // When user first signs in, store role from the authorize return
      if (user) {
        token.role = (user as Record<string, unknown>).role
      }
      // Always refresh role/name/image/onboarding status from DB so profile
      // edits (e.g. a new avatar upload, finishing onboarding) show up
      // immediately without requiring a re-login
      if (token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true, name: true, image: true, onboardingCompletedAt: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.name = dbUser.name
          token.picture = dbUser.image
          token.onboardingCompleted = dbUser.onboardingCompletedAt !== null
        }
      }
      return token
    },
  },
})
