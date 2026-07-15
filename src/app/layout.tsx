import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { syncUserToDatabase } from "@/lib/clerk-auth/sync-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuAI - AI-Powered Document Analysis",
  description: "Analyze and collaborate on documents with Google Gemini AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await syncUserToDatabase();
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header/>
            {/* Main */}
            <main className="flex-1"> {children}</main>
           {/* Footer */}
           <Footer/>
            </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
