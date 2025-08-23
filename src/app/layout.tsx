import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/css/picker.css";
import { Toaster } from "sonner";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { Viewport } from "next"
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "FitStreak",
  description: "Bunc Venture",
  themeColor: "black",
  manifest: "../public/manifest.json",
  icons: {
    apple: "/icons/ios/AppIcon-180@2x.png",
    icon: "/icons/android/res/mipmap-xxxhdpi/ic_launcher.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black overscroll-contain scroll-smooth"
      suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FitStreak" />

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

        <link rel="manifest" href="../public/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black dark:bg-black text-black dark:text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />

          {/* Always show header */}

          <AuthenticatedLayout>

            {/* Wrap all pages with AuthenticatedLayout */}
            {children}
          </AuthenticatedLayout>

        </ThemeProvider>

      </body>
    </html>
  );
}