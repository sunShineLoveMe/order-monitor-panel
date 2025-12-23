import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/TopNavbar";
import { Toaster } from "@/components/toaster";
import DynamicBackground from "@/components/DynamicBackground";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Argus AI | 阿格斯之眼",
  description: "全链路全时态智能监测平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <DynamicBackground />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
