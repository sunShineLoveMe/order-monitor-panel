"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { 
  ArrowLeft, 
  Clock, 
  File, 
  FileText, 
  FilePlus, 
  MessageSquare, 
  MoreVertical, 
  RefreshCw, 
  Search, 
  Trash2, 
  Upload 
} from "lucide-react";
import { KnowledgeBase } from "./KnowledgeBaseList";
import UploadDocumentDialog from "./UploadDocumentDialog";

// 模拟知识库数据
const mockKnowledgeBases: Record<string, KnowledgeBase> = {
  'kb-001': {
    id: 'kb-001',
    name: '产品知识库',
    description: '包含所有产品相关的信息、规格和使用指南',
    createdAt: '2023-08-15T08:00:00Z',
    updatedAt: '2023-09-20T15:30:00Z',
    documentsCount: 27,
    status: 'ready'
  },
  'kb-002': {
    id: 'kb-002',
    name: '供应商管理手册',
    description: '供应商筛选、评估和合作流程的完整指南',
    createdAt: '2023-09-01T10:15:00Z',
    updatedAt: '2023-09-18T09:45:00Z',
    documentsCount: 13,
    status: 'ready'
  },
  'kb-003': {
    id: 'kb-003',
    name: '员工培训材料',
    description: '新员工入职培训和岗位技能培训资料',
    createdAt: '2023-07-25T14:30:00Z',
    updatedAt: '2023-09-22T16:20:00Z',
    documentsCount: 42,
    status: 'ready'
  },
  'kb-004': {
    id: 'kb-004',
    name: '仓储操作指南',
    description: '仓库管理流程、库存盘点和物流配送标准操作流程',
    createdAt: '2023-06-10T11:45:00Z',
    updatedAt: '2023-09-15T13:10:00Z',
    documentsCount: 18,
    status: 'ready'
  }
};

// 文档类型
interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processed' | 'processing' | 'failed';
  chunks?: number;
}

// 模拟文档数据
const mockDocuments: Record<string, Document[]> = {
  'kb-001': [
    {
      id: 'doc-001',
      name: '产品规格说明书v2.0.pdf',
      type: 'application/pdf',
      size: 2456000,
      uploadedAt: '2023-09-18T09:30:00Z',
      status: 'processed',
      chunks: 42
    },
    {
      id: 'doc-002',
      name: '用户操作手册.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1256000,
      uploadedAt: '2023-09-15T14:20:00Z',
      status: 'processed',
      chunks: 28
    },
    {
      id: 'doc-003',
      name: '产品常见问题解答.md',
      type: 'text/markdown',
      size: 45600,
      uploadedAt: '2023-09-20T11:15:00Z',
      status: 'processed',
      chunks: 12
    },
    {
      id: 'doc-004',
      name: '维修保养指南.pdf',
      type: 'application/pdf',
      size: 3256000,
      uploadedAt: '2023-09-10T16:45:00Z',
      status: 'processed',
      chunks: 56
    }
  ],
  'kb-002': [
    {
      id: 'doc-005',
      name: '供应商评估标准.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 856000,
      uploadedAt: '2023-09-05T10:30:00Z',
      status: 'processed',
      chunks: 15
    },
    {
      id: 'doc-006',
      name: '采购流程指南.pdf',
      type: 'application/pdf',
      size: 1856000,
      uploadedAt: '2023-09-08T13:20:00Z',
      status: 'processed',
      chunks: 32
    }
  ],
  'kb-003': [
    {
      id: 'doc-007',
      name: '新员工入职手册.pdf',
      type: 'application/pdf',
      size: 2056000,
      uploadedAt: '2023-07-28T09:15:00Z',
      status: 'processed',
      chunks: 38
    }
  ],
  'kb-004': [
    {
      id: 'doc-008',
      name: '仓库安全管理规范.pdf',
      type: 'application/pdf',
      size: 1656000,
      uploadedAt: '2023-06-15T11:20:00Z',
      status: 'processed',
      chunks: 27
    }
  ]
};

interface KnowledgeDetailProps {
  knowledgeBaseId: string;
  onBack: () => void;
  onChat: () => void;
}

export default function KnowledgeDetail({ 
  knowledgeBaseId, 
  onBack,
  onChat
}: KnowledgeDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // 获取知识库信息
  const knowledgeBase = mockKnowledgeBases[knowledgeBaseId];
  const documents = mockDocuments[knowledgeBaseId] || [];
  
  // 根据搜索筛选文档
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  const handleDeleteDocument = (docId: string) => {
    console.log('删除文档:', docId);
    // 实际实现需要调用API删除文档
  };

  const handleRefreshDocument = (docId: string) => {
    console.log('刷新文档状态:', docId);
    // 实际实现需要调用API刷新文档状态
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="h-4 w-4 text-red-500" />;
    if (type.includes('word')) return <File className="h-4 w-4 text-blue-500" />;
    if (type.includes('sheet')) return <File className="h-4 w-4 text-green-500" />;
    if (type.includes('markdown')) return <File className="h-4 w-4 text-purple-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回列表
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">{knowledgeBase.name}</h2>
        <div className={`ml-2 px-2 py-1 text-xs rounded-full ${
          knowledgeBase.status === 'ready' ? 'bg-green-100 text-green-800' : 
          knowledgeBase.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}>
          {knowledgeBase.status === 'ready' ? '可用' : 
           knowledgeBase.status === 'processing' ? '处理中' : '错误'}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>知识库信息</CardTitle>
          <CardDescription>管理知识库基本信息和文档</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">描述</h3>
              <p>{knowledgeBase.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">创建时间</h3>
                <p className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(knowledgeBase.createdAt)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">更新时间</h3>
                <p className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(knowledgeBase.updatedAt)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">文档列表 ({documents.length})</h3>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索文档..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  上传文档
                </Button>
              </div>
            </div>
            
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
                <FilePlus className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">没有找到文档</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery ? '没有匹配的搜索结果，请尝试其他关键词' : '开始上传文档到此知识库'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    上传文档
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>文档名称</TableHead>
                      <TableHead>大小</TableHead>
                      <TableHead>上传时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.type)}
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.size)}</TableCell>
                        <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              doc.status === 'processed' ? 'bg-green-500' : 
                              doc.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span>
                              {doc.status === 'processed' ? '已处理' : 
                               doc.status === 'processing' ? '处理中' : '处理失败'}
                            </span>
                            {doc.status === 'processed' && doc.chunks && (
                              <span className="text-xs text-muted-foreground">
                                ({doc.chunks} 个块)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRefreshDocument(doc.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                刷新状态
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除文档
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4 mt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <Button 
          onClick={onChat}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          知识库问答
        </Button>
      </div>

      <UploadDocumentDialog 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog}
        knowledgeBaseId={knowledgeBaseId}
        knowledgeBaseName={knowledgeBase.name}
      />
    </div>
  );
} 