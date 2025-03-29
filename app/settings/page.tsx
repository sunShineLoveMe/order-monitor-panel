"use client";

import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";
import GeneralSettingsForm from "@/components/settings/GeneralSettingsForm";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统设置</h1>
          <p className="text-muted-foreground">
            管理系统的通用配置
          </p>
        </div>
      </div>

      <GeneralSettingsForm />
    </div>
  );
} 