import QRCode from "qrcode"

export async function generateQRCodeDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  })
}

export async function generateQRCodeSVG(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    width: 300,
    margin: 2,
  })
}
