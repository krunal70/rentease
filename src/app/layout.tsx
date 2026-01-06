import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentEase - Find Your Perfect Rental",
  description:
    "RentEase is a comprehensive rental platform that connects property owners, property managers, and tenants through an intelligent, feature-rich application.",
  keywords: [
    "rental",
    "property",
    "apartment",
    "house",
    "lease",
    "tenant",
    "landlord",
    "property manager",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
