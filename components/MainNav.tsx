"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboardIcon, 
  PackageIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  BrainCircuitIcon 
} from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "数据面板",
      icon: <LayoutDashboardIcon className="h-4 w-4" />,
      active: pathname === "/",
    },
    {
      href: "/inbound",
      label: "入库管理",
      icon: <ArrowDownIcon className="h-4 w-4" />,
      active: pathname === "/inbound",
    },
    {
      href: "/outbound",
      label: "出库管理",
      icon: <ArrowUpIcon className="h-4 w-4" />,
      active: pathname === "/outbound",
    },
    {
      href: "/inventory",
      label: "库存查询",
      icon: <PackageIcon className="h-4 w-4" />,
      active: pathname === "/inventory",
    },
    {
      href: "/predictions",
      label: "AI 预测",
      icon: <BrainCircuitIcon className="h-4 w-4" />,
      active: pathname === "/predictions",
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            item.active
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <span className="mr-2">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 