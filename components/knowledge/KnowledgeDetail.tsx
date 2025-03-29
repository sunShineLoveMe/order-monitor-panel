"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Search, Upload, Pencil, Calendar, FileText, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { KnowledgeBase, KnowledgeBaseDocument, knowledgeBaseService } from "@/services/knowledgeBaseService";
import { formatFileSize, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface KnowledgeDetailProps {
  knowledgeBaseId: string;
  onBack: () => void;
}

export default function KnowledgeDetail({ knowledgeBaseId, onBack }: KnowledgeDetailProps) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载知识库和文档
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 获取知识库详情
        const knowledgeBaseData = await knowledgeBaseService.getKnowledgeBase(knowledgeBaseId);
        setKnowledgeBase(knowledgeBaseData);

        // 获取文档列表
        const documentsData = await knowledgeBaseService.getDocuments(knowledgeBaseId);
        setDocuments(documentsData);
        setFilteredDocuments(documentsData);
      } catch (error) {
        console.error("加载知识库详情失败:", error);
        toast({
          title: "加载失败",
          description: "无法加载知识库详情，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [knowledgeBaseId]);

  // 根据搜索词过滤文档
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.filename.toLowerCase().includes(query) || 
      doc.fileType.toLowerCase().includes(query)
    );
    
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 遍历上传的所有文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // 上传文件
        await knowledgeBaseService.uploadDocument(knowledgeBaseId, file);
        
        // 添加到文档列表中（实际场景可能需要刷新整个列表）
        const newDocument: KnowledgeBaseDocument = {
          id: `temp-${Date.now()}-${i}`,
          knowledgeBaseId,
          filename: file.name,
          fileType: file.name.split('.').pop() || '',
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          status: 'processing'
        };
        
        setDocuments(prev => [...prev, newDocument]);
        
        toast({
          title: "文件上传成功",
          description: `${file.name} 已开始处理`,
        });
      } catch (error) {
        console.error("上传文件失败:", error);
        toast({
          title: "上传失败",
          description: `无法上传 ${file.name}，请稍后重试`,
          variant: "destructive",
        });
      }
    }
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理文档删除
  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm("确定要删除此文档吗？此操作无法撤销。")) {
      try {
        await knowledgeBaseService.deleteDocument(knowledgeBaseId, documentId);
        
        // 从列表中移除
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        toast({
          title: "文档已删除",
          description: "文档已成功从知识库中删除",
        });
      } catch (error) {
        console.error("删除文档失败:", error);
        toast({
          title: "删除失败",
          description: "无法删除文档，请稍后重试",
          variant: "destructive",
        });
      }
    }
  };

  // 触发文件上传对话框
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 获取文档状态徽章
  const getDocumentStatusBadge = (status: KnowledgeBaseDocument['status']) => {
    switch (status) {
      case 'indexed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            已索引
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse mr-1" />
            处理中
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            处理失败
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            未知状态
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-4" />
        <p className="text-muted-foreground">加载知识库详情...</p>
      </div>
    );
  }

  if (!knowledgeBase) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">无法加载知识库</h2>
        <p className="text-muted-foreground mb-4">找不到指定的知识库或发生错误</p>
        <Button onClick={onBack}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 顶部导航和基本信息 */}
      <div className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{knowledgeBase.name}</h2>
            <p className="text-sm text-muted-foreground">
              {knowledgeBase.description || "无描述"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 flex items-center">
              <FileText className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-sm font-medium">文档数量</p>
                <p className="text-2xl font-bold">{knowledgeBase.documentCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-sm font-medium">创建时间</p>
                <p className="text-sm">{formatDateTime(knowledgeBase.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm font-medium">状态: {knowledgeBase.status}</p>
              </div>
              <Button variant="outline" size="sm">
                <Pencil className="h-3 w-3 mr-1" />
                编辑信息
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="documents">文档管理</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,.json"
          />
          
          <Button onClick={triggerFileUpload} className="ml-4">
            <Upload className="h-4 w-4 mr-2" />
            上传文档
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="documents" className="mt-0">
            {/* 搜索区域 */}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文档..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 文档列表 */}
            {filteredDocuments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>文件名</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>大小</TableHead>
                      <TableHead>上传时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            {doc.filename}
                          </div>
                        </TableCell>
                        <TableCell>{doc.fileType.toUpperCase()}</TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>{formatDateTime(doc.uploadedAt)}</TableCell>
                        <TableCell>{getDocumentStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="mt-2 text-lg font-semibold">没有文档</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    {searchQuery ? "没有找到匹配的文档" : "点击「上传文档」按钮添加文档"}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchQuery("")}
                    >
                      清除搜索
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>知识库设置</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  设置功能尚在开发中，敬请期待
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 