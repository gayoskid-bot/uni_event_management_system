import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "UniEvents - University Event Management & Discovery",
    template: "%s | UniEvents",
  },
  description:
    "Discover, create, and manage university events. Find academic, social, sports, and cultural events happening on campus.",
  keywords: ["university events", "campus events", "event management", "student events"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
