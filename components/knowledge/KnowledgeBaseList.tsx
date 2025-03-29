"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, MessagesSquare, FileText, Loader2, Trash2, PenSquare } from "lucide-react";
import KnowledgeBaseChat from "./KnowledgeBaseChat";

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  documentsCount: number;
  status: 'creating' | 'processing' | 'ready' | 'error';
}

// 模拟知识库数据
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-001',
    name: '产品知识库',
    description: '包含所有产品相关的信息、规格和使用指南',
    createdAt: '2023-08-15T08:00:00Z',
    updatedAt: '2023-09-20T15:30:00Z',
    documentsCount: 27,
    status: 'ready'
  },
  {
    id: 'kb-002',
    name: '供应商管理手册',
    description: '供应商筛选、评估和合作流程的完整指南',
    createdAt: '2023-09-01T10:15:00Z',
    updatedAt: '2023-09-18T09:45:00Z',
    documentsCount: 13,
    status: 'ready'
  },
  {
    id: 'kb-003',
    name: '员工培训材料',
    description: '新员工入职培训和岗位技能培训资料',
    createdAt: '2023-07-25T14:30:00Z',
    updatedAt: '2023-09-22T16:20:00Z',
    documentsCount: 42,
    status: 'ready'
  },
  {
    id: 'kb-004',
    name: '仓储操作指南',
    description: '仓库管理流程、库存盘点和物流配送标准操作流程',
    createdAt: '2023-06-10T11:45:00Z',
    updatedAt: '2023-09-15T13:10:00Z',
    documentsCount: 18,
    status: 'ready'
  },
  {
    id: 'kb-005',
    name: '品控检验手册',
    description: '原材料和成品质量检验标准与流程',
    createdAt: '2023-09-05T09:20:00Z',
    updatedAt: '2023-09-05T09:20:00Z',
    documentsCount: 0,
    status: 'creating'
  }
];

export default function KnowledgeBaseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(null);
  
  // 过滤知识库
  const filteredKnowledgeBases = mockKnowledgeBases.filter(kb => 
    kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kb.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  
  // 状态标签
  const getStatusBadge = (status: KnowledgeBase['status']) => {
    switch (status) {
      case 'creating':
        return <Badge variant="secondary" className="flex gap-1 items-center"><Loader2 className="h-3 w-3 animate-spin" />创建中</Badge>;
      case 'processing':
        return <Badge variant="outline" className="flex gap-1 items-center"><Loader2 className="h-3 w-3 animate-spin" />处理中</Badge>;
      case 'ready':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">就绪</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
      default:
        return null;
    }
  };
  
  const handleStartChat = (id: string) => {
    setSelectedKnowledgeBaseId(id);
  };
  
  const handleBackToList = () => {
    setSelectedKnowledgeBaseId(null);
  };
  
  if (selectedKnowledgeBaseId) {
    return <KnowledgeBaseChat knowledgeBaseId={selectedKnowledgeBaseId} onBack={handleBackToList} />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">知识库管理</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>创建知识库</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>我的知识库</CardTitle>
          <CardDescription>
            创建和管理AI可以查询的知识库，上传文档自动构建问答系统
          </CardDescription>
          <div className="flex items-center mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索知识库..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>文档数量</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead>更新日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKnowledgeBases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    未找到匹配的知识库
                  </TableCell>
                </TableRow>
              ) : (
                filteredKnowledgeBases.map((kb) => (
                  <TableRow key={kb.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{kb.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {kb.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{kb.documentsCount}</TableCell>
                    <TableCell>{formatDate(kb.createdAt)}</TableCell>
                    <TableCell>{formatDate(kb.updatedAt)}</TableCell>
                    <TableCell>{getStatusBadge(kb.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1"
                          disabled={kb.status !== 'ready'}
                          onClick={() => handleStartChat(kb.id)}
                        >
                          <MessagesSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">对话</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1"
                          onClick={() => console.log('查看文档', kb.id)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">文档</span>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => console.log('编辑', kb.id)}>
                              <PenSquare className="h-4 w-4" />
                              <span>编辑知识库</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => console.log('删除', kb.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span>删除知识库</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div>共 {filteredKnowledgeBases.length} 个知识库</div>
            {searchQuery && (
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs"
                onClick={() => setSearchQuery('')}
              >
                清除搜索
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 