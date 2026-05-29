import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SafeProviders from "./components/SafeProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "Ecyce MediLink",
  description: "Smart Medicine Box Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full flex flex-col bg-[#F0F7FF] text-[#001A33] font-sans" suppressHydrationWarning>
        <SafeProviders>
          {children}
        </SafeProviders>
      </body>
    </html>
  );
}
