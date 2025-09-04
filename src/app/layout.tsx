import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/css/picker.css";
import { Toaster } from "sonner";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { ThemeProvider } from "next-themes";
import PageTransition from "@/components/PageTransition";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { useFCM } from "@/hooks/useFCM";

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
  themeColor: "black",
};

export const metadata: Metadata = {
  title: "FitStreak",
  description: "Bunc Venture",
  manifest: "/manifest.json",
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black overscroll-contain scroll-smooth dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FitStreak" />
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
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <ServiceWorkerRegistrar />
          {/* Wrap the children with AuthenticatedLayout */}
          <AuthenticatedLayout>
            <PageTransition>{children}</PageTransition>
          </AuthenticatedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}