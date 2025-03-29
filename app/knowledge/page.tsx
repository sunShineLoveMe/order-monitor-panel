"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import KnowledgeBaseList from "@/components/knowledge/KnowledgeBaseList";
import { CreateKnowledgeBaseDialog } from "@/components/knowledge/CreateKnowledgeBaseDialog";
import { PlusCircle } from "lucide-react";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("knowledge-bases");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleKnowledgeBaseCreated = () => {
    // 刷新知识库列表
    // 在实际环境中，可以使用React Query, SWR等工具自动刷新
    window.location.reload();
  };

  return (
    <div className="container p-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识库管理</h1>
          <p className="text-muted-foreground mt-2">
            创建和管理您的自定义知识库，通过AI实现智能问答
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          创建知识库
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="knowledge-bases">知识库列表</TabsTrigger>
          <TabsTrigger value="usage">使用统计</TabsTrigger>
        </TabsList>
        <TabsContent value="knowledge-bases" className="space-y-4">
          <KnowledgeBaseList />
        </TabsContent>
        <TabsContent value="usage" className="space-y-4">
          <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">使用统计功能开发中</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                此功能正在开发中，敬请期待。您将能够查看知识库的使用情况、查询次数和性能指标。
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateKnowledgeBaseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleKnowledgeBaseCreated}
      />
    </div>
  );
} 