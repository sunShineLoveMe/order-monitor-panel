"use client";

import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import ModelSettingsManager from "@/components/settings/ModelSettingsManager";
import { BrainCircuit, Database, TestTube2 } from "lucide-react";
import Link from "next/link";

export default function ModelsSettingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">模型管理</h1>
        <Button asChild>
          <Link href="/settings/models/test" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            <span>测试模型配置</span>
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        配置和管理AI模型设置，支持多种模型提供商的接口
      </p>
      
      <Alert className="bg-amber-50 border-amber-200 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">重要提示：服务器端配置</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          为了解决某些环境下的多模态API调用问题，建议直接通过环境变量配置硅基流动模型：
          <ol className="list-decimal list-inside mt-2 pl-2 space-y-1 text-xs">
            <li>在项目根目录编辑 <code className="bg-amber-100 px-1 rounded">.env.local</code> 文件</li>
            <li>添加硅基流动模型配置（查看测试页面获取详细配置）</li>
            <li>重启服务器使配置生效</li>
          </ol>
          <div className="mt-2">
            <Button size="sm" variant="outline" asChild className="text-xs h-7">
              <Link href="/settings/models/test">
                查看环境变量配置指南
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">配置硅基流动模型提示</AlertTitle>
        <AlertDescription className="text-blue-700 text-sm">
          如果您使用硅基流动的Qwen2-VL模型进行订单识别，请确保以下设置正确：
          <ul className="list-disc list-inside mt-2 pl-2 space-y-1">
            <li>提供商(Provider)设置为 <code className="bg-blue-100 px-1 rounded">siliconflow</code></li>
            <li>API端点设置为 <code className="bg-blue-100 px-1 rounded">https://api.siliconflow.cn/v1</code></li>
            <li>确保多模态支持已启用</li>
            <li>完成配置后请使用右上角的"测试模型配置"按钮验证设置</li>
          </ul>
        </AlertDescription>
      </Alert>

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