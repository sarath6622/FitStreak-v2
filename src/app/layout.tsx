import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/css/picker.css";
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
  themeColor: "black",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/ios/AppIcon-180@2x.png",
    icon: "/icons/android/res/mipmap-xxxhdpi/ic_launcher.png",
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
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FitStreak" />
        <meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1, viewport-fit=cover" />

        {/* Icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/ios/AppIcon-180@2x.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/ios/AppIcon-83.5@2x~ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/ios/AppIcon-76@2x~ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/ios/AppIcon-60@2x.png"
        />

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black dark:bg-black text-black dark:text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
      >
        {/* Always show header */}

        <AuthenticatedLayout>

        {/* Wrap all pages with AuthenticatedLayout */}
          {children}
        </AuthenticatedLayout>

        {/* Global toaster notifications */}
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
      </body>
    </html>
  );
}