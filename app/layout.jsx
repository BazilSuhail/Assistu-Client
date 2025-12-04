import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import ClientLayout from "./client-layout"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: 'Assistu - Academic Assistant', // This is the tab title
  description: 'Your intelligent voice-enabled student assistant.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-background text-foreground transition-colors`}>

        <ClientLayout geistMono={geistMono}>
          {children}
        </ClientLayout>

        <div id="modal-root" />
      </body>
    </html>
  )
}
