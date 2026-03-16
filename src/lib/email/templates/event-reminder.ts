interface ReminderEmailProps {
  userName: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  eventSlug: string
  timeUntil: string
}

export function eventReminderEmail({
  userName,
  eventTitle,
  eventDate,
  eventVenue,
  eventSlug,
  timeUntil,
}: ReminderEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="background-color:#18181b; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">UniEvents</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="text-align:center; margin-bottom:24px;">
                <span style="font-size:40px;">&#9200;</span>
                <h2 style="margin:8px 0; font-size:20px; color:#18181b;">Event Starting ${timeUntil}!</h2>
              </div>
              <p style="color:#3f3f46; font-size:15px;">Hi ${userName},</p>
              <p style="color:#3f3f46; font-size:15px;">This is a reminder that your event is coming up soon:</p>
              <table width="100%" style="background:#f4f4f5; border-radius:8px; margin:20px 0;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="margin:0 0 8px; color:#18181b;">${eventTitle}</h3>
                    <p style="margin:4px 0; color:#71717a; font-size:14px;">&#128197; ${eventDate}</p>
                    <p style="margin:4px 0; color:#71717a; font-size:14px;">&#128205; ${eventVenue}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/events/${eventSlug}" style="display:inline-block; background:#18181b; color:#fff; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">
                      View Event
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; background:#f4f4f5; text-align:center;">
              <p style="margin:0; color:#a1a1aa; font-size:12px;">&copy; ${new Date().getFullYear()} UniEvents</p>
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
