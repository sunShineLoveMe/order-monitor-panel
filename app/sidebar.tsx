import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  LayoutDashboard,
  PackageSearch,
  PackageOpen,
  PackagePlus,
  Settings,
  FileBox,
  Brain,
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function Sidebar({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start gap-2"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export function SidebarLinks() {
  const items = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: <PackageSearch className="h-4 w-4" />,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: <FileBox className="h-4 w-4" />,
    },
    {
      title: "Inbound",
      href: "/inbound",
      icon: <PackagePlus className="h-4 w-4" />,
    },
    {
      title: "Outbound",
      href: "/outbound",
      icon: <PackageOpen className="h-4 w-4" />,
    },
    {
      title: "Knowledge Base",
      href: "/knowledge",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return <Sidebar items={items} />;
} 