"use client";

import { useState, useEffect } from "react";
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
import { Search, Plus, MoreHorizontal, MessagesSquare, FileText, Loader2, Trash2, PenSquare, MessageSquare, File, Edit, XCircle, CheckCircle } from "lucide-react";
import KnowledgeBaseChat from "./KnowledgeBaseChat";
import { KnowledgeBase, knowledgeBaseService } from "@/lib/services/knowledgeBase";
import { format } from "date-fns";
import KnowledgeDetail from "./KnowledgeDetail";

interface KnowledgeBaseListProps {
  // 如果需要任何props，可以在这里添加
}

export default function KnowledgeBaseList({}: KnowledgeBaseListProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [filteredBases, setFilteredBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBase, setSelectedBase] = useState<KnowledgeBase | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  useEffect(() => {
    // 加载知识库列表
    const fetchKnowledgeBases = async () => {
      try {
        const bases = await knowledgeBaseService.getKnowledgeBases();
        setKnowledgeBases(bases);
        setFilteredBases(bases);
      } catch (error) {
        console.error("获取知识库列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeBases();
  }, []);

  useEffect(() => {
    // 根据搜索过滤知识库
    if (!searchQuery.trim()) {
      setFilteredBases(knowledgeBases);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = knowledgeBases.filter(
      kb => kb.name.toLowerCase().includes(query) || 
            (kb.description && kb.description.toLowerCase().includes(query))
    );
    setFilteredBases(filtered);
  }, [searchQuery, knowledgeBases]);

  // 格式化日期
  const formatDate = (date: Date) => {
    return format(new Date(date), 'yyyy/MM/dd');
  };

  // 状态徽章
  const getStatusBadge = (status: KnowledgeBase['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> 可用</Badge>;
      case 'indexing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> 索引中</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> 错误</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // 处理开始聊天
  const handleStartChat = (kb: KnowledgeBase) => {
    setSelectedBase(kb);
    setIsChatting(true);
    setIsViewingDetails(false);
  };

  // 处理查看详情
  const handleViewDetails = (kb: KnowledgeBase) => {
    setSelectedBase(kb);
    setIsViewingDetails(true);
    setIsChatting(false);
  };

  // 返回列表
  const handleBackToList = () => {
    setSelectedBase(null);
    setIsChatting(false);
    setIsViewingDetails(false);
  };

  // 渲染知识库聊天界面
  if (isChatting && selectedBase) {
    // 转换Date类型为string类型
    const convertedKb = {
      id: selectedBase.id,
      name: selectedBase.name,
      description: selectedBase.description,
      documentCount: selectedBase.documentCount,
      createdAt: selectedBase.createdAt instanceof Date ? selectedBase.createdAt.toISOString() : selectedBase.createdAt,
      updatedAt: selectedBase.updatedAt instanceof Date ? selectedBase.updatedAt.toISOString() : selectedBase.updatedAt,
      status: selectedBase.status,
      embeddingModel: selectedBase.embeddingModel
    };
    return <KnowledgeBaseChat knowledgeBase={convertedKb} onBack={handleBackToList} />;
  }

  // 渲染知识库详情界面
  if (isViewingDetails && selectedBase) {
    return <KnowledgeDetail knowledgeBaseId={selectedBase.id} onBack={handleBackToList} />;
  }

  // 渲染知识库列表
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
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : filteredBases.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <div className="text-muted-foreground">暂无数据</div>
            </div>
          ) : (
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
                {filteredBases.map((kb) => (
                  <TableRow key={kb.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div>{kb.name}</div>
                      {kb.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {kb.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{kb.documentCount}</TableCell>
                    <TableCell>{formatDate(kb.createdAt)}</TableCell>
                    <TableCell>{formatDate(kb.updatedAt)}</TableCell>
                    <TableCell>{getStatusBadge(kb.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStartChat(kb)}
                          title="开始聊天"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="查看详情"
                          onClick={() => handleViewDetails(kb)}
                        >
                          <File className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div>共 {filteredBases.length} 个知识库</div>
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