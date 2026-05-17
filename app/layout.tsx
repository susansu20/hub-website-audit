import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://audit.hubsolutions.one"),
  title: {
    default: "What Era Is Your Website? · Hub Solutions Audit",
    template: "%s · Hub Solutions Audit",
  },
  description:
    "Paste your URL. Get your UX score, era verdict, and 90-day lead forecast in 60 seconds. Built by Hub Solutions Digital.",
  openGraph: {
    title: "What Era Is Your Website?",
    description:
      "Get your UX score, era verdict, and 90-day lead forecast in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-hub-bg text-hub-ink antialiased">
        {children}
      </body>
    </html>
  );
}
