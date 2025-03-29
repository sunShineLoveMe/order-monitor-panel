"use client";

import KnowledgeBaseList from "@/components/knowledge/KnowledgeBaseList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function KnowledgePage() {
  return (
    <div className="px-6 py-8 flex-1 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">知识库管理</h1>
        <p className="text-muted-foreground">
          创建和管理AI可查询的知识库，支持文档上传、信息检索和自动问答
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">知识库列表</TabsTrigger>
          <TabsTrigger value="stats">使用统计</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <KnowledgeBaseList />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-6">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium mb-2">知识库使用统计</h3>
            <p className="text-muted-foreground">
              统计功能开发中，敬请期待...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 