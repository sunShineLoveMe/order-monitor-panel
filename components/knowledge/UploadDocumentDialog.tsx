"use client";

import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, AlertCircle, CheckCircle2, X } from "lucide-react";
import { knowledgeBaseService } from "@/lib/services/knowledgeBase";

interface UploadDocumentDialogProps {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadDocumentDialog({
  knowledgeBaseId,
  knowledgeBaseName,
  open,
  onOpenChange,
  onSuccess
}: UploadDocumentDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的文件类型
  const supportedFileTypes = [
    'application/pdf', 
    'text/plain', 
    'text/csv', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'text/markdown'
  ];

  // 文件扩展名映射
  const fileExtensionMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/json': 'JSON',
    'text/markdown': 'MD'
  };

  // 清除上传状态
  const resetUploadState = () => {
    setFiles([]);
    setUploading(false);
  };

  // 关闭对话框时重置状态
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetUploadState();
    }
    onOpenChange(newOpen);
  };

  // 处理文件拖放
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // 处理文件选择或拖放完成
  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles)
      .filter(file => supportedFileTypes.includes(file.type))
      .map(file => ({
        file,
        progress: 0,
        status: 'pending' as const
      }));
    
    if (newFiles.length === 0) {
      alert("请上传有效的文档文件 (PDF, TXT, CSV, DOCX, XLSX, JSON, MD)");
      return;
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  // 处理文件拖放完成
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFiles(e.dataTransfer.files);
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // 重置input，以便能够重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 点击按钮触发文件选择
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 从文件列表中移除文件
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 上传所有文件
  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;
    
    setUploading(true);
    
    // 更新所有文件状态为上传中
    setFiles(prev => prev.map(file => ({ ...file, status: 'uploading', progress: 0 })));
    
    // 逐个上传文件
    for (let i = 0; i < files.length; i++) {
      try {
        // 如果文件已上传成功或者出错，跳过
        if (files[i].status === 'success' || files[i].status === 'error') continue;
        
        // 模拟上传进度
        const updateProgress = (progress: number) => {
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[i] = { ...newFiles[i], progress };
            return newFiles;
          });
        };
        
        // 模拟进度更新
        const progressInterval = setInterval(() => {
          setFiles(prev => {
            const file = prev[i];
            if (file.progress < 90) {
              const newFiles = [...prev];
              newFiles[i] = { ...file, progress: file.progress + 10 };
              return newFiles;
            }
            return prev;
          });
        }, 300);
        
        // 上传文件
        await knowledgeBaseService.uploadDocument(knowledgeBaseId, files[i].file);
        
        // 清除进度更新
        clearInterval(progressInterval);
        
        // 更新状态为成功
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success', progress: 100 };
          return newFiles;
        });
      } catch (error) {
        // 更新状态为错误
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { 
            ...newFiles[i], 
            status: 'error', 
            error: error instanceof Error ? error.message : '上传失败'
          };
          return newFiles;
        });
      }
    }
    
    // 检查是否所有文件都上传完成
    const allCompleted = files.every(file => 
      file.status === 'success' || file.status === 'error'
    );
    
    if (allCompleted) {
      setUploading(false);
      
      // 如果有成功上传的文件，调用成功回调
      if (files.some(file => file.status === 'success') && onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传文档到知识库</DialogTitle>
          <DialogDescription>
            您正在向知识库 <span className="font-semibold">{knowledgeBaseName}</span> 上传文档
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 拖放区域 */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                拖放文件到此处，或
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="mx-1 text-primary hover:underline focus:outline-none"
                >
                  浏览文件
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                支持 PDF, TXT, CSV, DOCX, XLSX, JSON, MD 格式文件
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.txt,.csv,.docx,.xlsx,.json,.md"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="space-y-3 mt-4">
              <p className="text-sm font-medium">上传文件 ({files.length})</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-md bg-background"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-6 w-6 text-primary/70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="mr-2">
                            {fileExtensionMap[file.file.type] || '文档'}
                          </span>
                          <span>
                            {(file.file.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {file.status === 'uploading' && (
                        <div className="w-24">
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}
                      {file.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {files.some(file => file.status === 'error') && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                部分文件上传失败，请检查文件格式或稍后重试
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            {files.some(file => file.status === 'success') ? '完成' : '取消'}
          </Button>
          {files.length > 0 && files.some(file => file.status === 'pending') && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  上传文件 ({files.filter(f => f.status === 'pending').length})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 