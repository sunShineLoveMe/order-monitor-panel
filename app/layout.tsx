import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/TopNavbar";
import { Toaster } from "@/components/toaster";
import DynamicBackground from "@/components/DynamicBackground";

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
          <DynamicBackground />
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-hidden flex flex-col">
              <TopNavbar />
              <div className="flex-1 overflow-auto pt-14">
                {children}
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
