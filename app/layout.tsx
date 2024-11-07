import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster"
import Footer from "@/components/Footer"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Seratus Quiz App",
  description: "Create your own quiz and share with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={process.env.NEXT_PUBLIC_AFTER_SIGN_OUT_URL!}>
      <html lang="en" style={{ colorScheme: 'light', height: '100%' }} className="light">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-full`}>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
