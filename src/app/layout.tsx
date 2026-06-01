import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseIQ Enterprise Intelligence | RightSense Technologies",
  description:
    "Convert enterprise complexity into AI-native operating intelligence. Maps operating models, identifies AI transformation opportunities, and generates 90-day execution roadmaps.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "PulseIQ Enterprise Intelligence",
    description: "AI-native enterprise operating intelligence platform for CXOs",
    siteName: "PulseIQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
