import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitStreak",
  description: "Bunc Venture",
  themeColor: "#FFD700",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
    icon: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <head>
        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FitStreak" />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for Android and Safari */}
        <meta name="theme-color" content="#FFD700" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black dark:bg-black text-black dark:text-white`}
      >
        {/* Always show header */}
        <header className="top-0 z-50 flex justify-between items-center p-4 border-b bg-black border-gray-700 shadow-md text-white">
          <h1 className="text-lg font-semibold">FitStreak</h1>
          <div className="flex gap-4 items-center">{/* Additional header content */}</div>
        </header>

        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{
            style: {
              backgroundColor: "#1f2937",
              color: "white",
              fontFamily: "var(--font-geist-sans)",
              fontWeight: "600",
            },
          }}
        />

        <AuthenticatedLayout>
          <main className="pt-0 sm:pt-16 pb-16 sm:pb-0">{children}</main>
        </AuthenticatedLayout>
      </body>
    </html>
  );
}