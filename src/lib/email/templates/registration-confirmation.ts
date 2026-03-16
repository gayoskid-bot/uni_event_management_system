interface RegistrationEmailProps {
  userName: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  eventSlug: string
  qrCode: string
}

export function registrationConfirmationEmail({
  userName,
  eventTitle,
  eventDate,
  eventVenue,
  eventSlug,
  qrCode,
}: RegistrationEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registration Confirmed</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#18181b; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">UniEvents</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <div style="text-align:center; margin-bottom:24px;">
                <div style="display:inline-block; background-color:#dcfce7; border-radius:50%; padding:12px; margin-bottom:12px;">
                  <span style="font-size:28px;">&#10003;</span>
                </div>
                <h2 style="margin:0 0 8px; font-size:22px; color:#18181b;">You're Registered!</h2>
                <p style="margin:0; color:#71717a; font-size:14px;">Your spot has been confirmed</p>
              </div>

              <p style="color:#3f3f46; font-size:15px; line-height:1.6;">
                Hi ${userName},
              </p>
              <p style="color:#3f3f46; font-size:15px; line-height:1.6;">
                You've successfully registered for the following event:
              </p>

              <!-- Event Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; border-radius:8px; margin:20px 0;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="margin:0 0 12px; font-size:18px; color:#18181b;">${eventTitle}</h3>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0; color:#71717a; font-size:14px;">
                          &#128197; ${eventDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; color:#71717a; font-size:14px;">
                          &#128205; ${eventVenue}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color:#71717a; font-size:13px; text-align:center; margin:20px 0 8px;">
                Your QR code for check-in:
              </p>
              <p style="text-align:center; font-family:monospace; font-size:16px; background:#f4f4f5; padding:12px; border-radius:6px; letter-spacing:1px; color:#18181b;">
                ${qrCode}
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/events/${eventSlug}" style="display:inline-block; background-color:#18181b; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; padding:12px 32px; border-radius:8px;">
                      View Event Details
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#71717a; font-size:13px; text-align:center;">
                Need to cancel? Visit the event page or your
                <a href="${appUrl}/my-events" style="color:#18181b;">My Events</a> page.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#f4f4f5; text-align:center;">
              <p style="margin:0; color:#a1a1aa; font-size:12px;">
                &copy; ${new Date().getFullYear()} UniEvents. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
