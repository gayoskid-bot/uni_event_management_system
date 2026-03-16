import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "@/server/db"
import { loginSchema } from "@/lib/validations/auth.schema"

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
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
} satisfies NextAuthConfig
