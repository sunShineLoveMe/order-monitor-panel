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
  LucideIcon 
} from "lucide-react";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">MCP</h1>
        <p className="text-sm text-muted-foreground">订单管理与分析系统</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors ${
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">用户名</p>
            <p className="text-xs text-muted-foreground">管理员</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
