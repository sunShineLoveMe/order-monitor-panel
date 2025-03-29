"use client";

import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelSettingsManager from "@/components/settings/ModelSettingsManager";
import { BrainCircuit, Database } from "lucide-react";

export default function ModelsSettingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">模型管理</h1>
      </div>
      <p className="text-muted-foreground">
        配置和管理AI模型设置，支持多种模型提供商的接口
      </p>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span>模型设置</span>
          </TabsTrigger>
          <TabsTrigger value="models">模型列表</TabsTrigger>
          <TabsTrigger value="stats">使用统计</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-6">
          <ModelSettingsManager />
        </TabsContent>
        
        <TabsContent value="models" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI模型配置</CardTitle>
              <CardDescription>
                管理您的AI模型配置，包括API密钥、模型参数和默认设置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                这里将显示所有配置的AI模型，目前正在开发中...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>模型使用统计</CardTitle>
              <CardDescription>
                查看模型的使用情况、调用次数和API消耗
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                此功能正在开发中，敬请期待。您将能够查看各个模型的使用频率、响应时间和成本统计。
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 