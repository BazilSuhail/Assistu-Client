import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import ClientLayout from "./client-layout"
import Sidebar from "../components/layout/sidebar"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-background text-foreground transition-colors`}>

        <ClientLayout geistMono={geistMono}>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
