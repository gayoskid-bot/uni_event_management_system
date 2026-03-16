import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`)
    console.log(`[DEV EMAIL] Body: ${html.substring(0, 200)}...`)
    return { success: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "UniEvents <noreply@unievents.com>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Email send error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error("Email send exception:", error)
    return { success: false, error: "Failed to send email" }
  }
}
