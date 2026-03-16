import { auth } from "@/server/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session?.user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
