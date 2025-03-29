"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, BrainCircuit, Activity, Save } from "lucide-react";
import GeneralSettingsForm from "@/components/settings/GeneralSettingsForm";
import ModelSettingsManager from "@/components/settings/ModelSettingsManager";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统设置</h1>
          <p className="text-muted-foreground">
            管理系统配置和AI模型设置
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>通用设置</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span>模型设置</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsForm />
        </TabsContent>
        
        <TabsContent value="models" className="space-y-4">
          <ModelSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
} 