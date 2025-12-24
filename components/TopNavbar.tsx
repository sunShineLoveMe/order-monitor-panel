"use client";

import { useState } from "react";
import { Globe, User, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState("zh_CN");

  const languages = [
    { code: "zh_CN", name: "简体中文" },
    { code: "en_US", name: "English (US)" },
  ];

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    // 这里可以添加语言切换的逻辑
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-14 border-b border-border/40 bg-background/50 backdrop-blur-xl z-30">
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-lg font-bold argus-text-gradient">Argus AI 智能监控面板</h1>
      
        <div className="flex items-center space-x-4">
          {/* 语言选择 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={language === lang.code ? "bg-accent" : ""}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用户信息 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pl-2 pr-2 hover:bg-transparent">
                <Avatar className="h-8 w-8 mr-2 focus-visible:ring-0 border border-border">
                  <AvatarImage src={user?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.display_name?.[0] || user?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="mr-1 text-sm font-medium">{user?.display_name || user?.username || "Admin"}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-card border-border/50">
              <DropdownMenuItem className="cursor-pointer py-2.5">
                <User className="mr-2 h-4 w-4 text-slate-400" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 py-2.5"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>注销</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
 