"use server"

import bcrypt from "bcryptjs"
import { db } from "@/server/db"
import { signIn, signOut } from "@/server/auth"
import { registerSchema, loginSchema } from "@/lib/validations/auth.schema"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function register(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const validated = registerSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { name, email, password } = validated.data

  const existingUser = await db.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "An account with this email already exists" }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  })

  // Auto sign in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong during sign in" }
    }
    throw error
  }
}

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const validated = loginSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    await signIn("credentials", {
      email: rawData.email,
      password: rawData.password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" })
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
