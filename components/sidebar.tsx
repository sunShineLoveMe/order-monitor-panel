"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PackageSearch, 
  PackagePlus, 
  PackageMinus, 
  ClipboardList, 
  BarChart3, 
  BookOpen,
  Settings, 
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
    title: "仪表盘",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "订单列表",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    title: "入库管理",
    href: "/inbound",
    icon: PackagePlus,
  },
  {
    title: "出库管理",
    href: "/outbound",
    icon: PackageMinus,
  },
  {
    title: "库存查询",
    href: "/inventory",
    icon: PackageSearch,
  },
  {
    title: "数据分析",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "知识库",
    href: "/knowledge",
    icon: BookOpen,
  },
  {
    title: "系统设置",
    href: "/settings",
    icon: Settings,
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
    <aside className="h-screen w-64 bg-background border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground tracking-tight">鹰眼智能</h1>
        <p className="text-[10px] text-muted-foreground mt-1 font-medium">@CopyRight 栉云科技</p>
      </div>
      <nav className="flex flex-col gap-4 px-2 py-4 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
                pathname === item.href || (item.title === "系统设置" && pathname.startsWith("/settings"))
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={(e) => {
                if (item.title === "系统设置") {
                  setSettingsOpen(!settingsOpen);
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
            
            {/* 系统设置的子菜单 */}
            {item.title === "系统设置" && settingsOpen && (
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
