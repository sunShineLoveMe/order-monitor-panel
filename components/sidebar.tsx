"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity,
  Radar,
  ScanEye,
  Send,
  LayoutList,
  BrainCircuit,
  FileJson,
  Settings2,
  LucideIcon,
  Cpu,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    title: "态势感知",
    href: "/",
    icon: Activity,
  },
  {
    title: "全程追踪",
    href: "/orders",
    icon: Radar,
  },
  {
    title: "准入监管",
    href: "/inbound",
    icon: ScanEye,
  },
  {
    title: "外发调度",
    href: "/outbound",
    icon: Send,
  },
  {
    title: "资源看板",
    href: "/inventory",
    icon: LayoutList,
  },
  {
    title: "智能洞察",
    href: "/analytics",
    icon: BrainCircuit,
  },
  {
    title: "情报中心",
    href: "/knowledge",
    icon: FileJson,
  },
  {
    title: "核心配置",
    href: "/settings",
    icon: Settings2,
  },
];

// 系统设置的子菜单
const settingsSubItems: NavItem[] = [
  {
    title: "模型管理",
    href: "/settings/models",
    icon: Cpu,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = React.useState(pathname.startsWith("/settings"));

  return (
    <aside className="h-screen w-64 bg-background/50 backdrop-blur-xl border-r border-border/50 flex flex-col z-20">
      <div className="p-6 border-b border-border/50 argus-scan">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="栉云科技" className="h-10 w-auto object-contain" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Argus AI</h1>
        </div>
        <p className="text-[10px] mt-2 font-medium leading-relaxed argus-text-muted-gradient">
          阿格斯之眼 | 全链路全时态智能监测平台
        </p>
      </div>
      <nav className="flex flex-col gap-4 px-2 py-4 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                pathname === item.href || (item.title === "核心配置" && pathname.startsWith("/settings"))
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={(e) => {
                if (item.title === "核心配置") {
                  setSettingsOpen(!settingsOpen);
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
            
            {/* 系统设置的子菜单 */}
            {item.title === "核心配置" && settingsOpen && (
              <div className="ml-5 pl-3 border-l border-border mt-1 mb-1 space-y-1">
                {settingsSubItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                      pathname === subItem.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span className="text-sm">{subItem.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
