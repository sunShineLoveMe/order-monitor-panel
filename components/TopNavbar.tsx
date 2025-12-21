"use client";

import { useState } from "react";
import { Moon, Sun, Globe, User, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TopNavbar() {
  const { theme, setTheme } = useTheme();
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

          {/* 深色模式切换 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">切换主题</span>
          </Button>

          {/* 用户信息 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pl-2 pr-2">
                <Avatar className="h-8 w-8 mr-2 focus-visible:ring-0">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
                </Avatar>
                <span className="mr-1 text-sm font-medium">Admin</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">注销</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
 