'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/TopNavbar";
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/login');
    }
    if (!isLoading && user && isLoginPage) {
      router.push('/');
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090C14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <div className="text-blue-500 font-mono animate-pulse tracking-widest text-xs uppercase">
            Initialising Argus Control Systems...
          </div>
        </div>
      </div>
    );
  }

  // If we're not logged in and not on the login page, we'll redirect,
  // but we should show nothing in the meantime.
  if (!user && !isLoginPage) {
    return null;
  }

  // If we're on the login page, just show the login content without sidebar/navbar
  if (isLoginPage) {
    return <main className="h-screen w-screen overflow-hidden">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <TopNavbar />
        <div className="flex-1 overflow-auto pt-14">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
