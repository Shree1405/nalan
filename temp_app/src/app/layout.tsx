import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/components/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nalan - Smart Patient Triage System",
  description: "AI-powered patient triage and risk assessment system for healthcare facilities",
  icons: {
    icon: [
      { url: '/naalan-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/naalan-logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/naalan-logo.png',
    shortcut: '/naalan-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
