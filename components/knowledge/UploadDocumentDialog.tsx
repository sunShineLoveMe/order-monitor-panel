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
import { Label } from "@/components/ui/label";
import { UploadCloud, X, File, AlertCircle } from "lucide-react";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
}

export default function UploadDocumentDialog({ 
  open, 
  onOpenChange,
  knowledgeBaseId,
  knowledgeBaseName
}: UploadDocumentDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // 这里可以添加实际的API调用来上传文件
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('上传文件到知识库:', knowledgeBaseId, files);
      
      // 上传成功后清空文件列表并关闭对话框
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error('文件上传失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    let color = "text-gray-500";
    
    if (type.includes('pdf')) color = "text-red-500";
    else if (type.includes('word')) color = "text-blue-500";
    else if (type.includes('sheet')) color = "text-green-500";
    else if (type.includes('image')) color = "text-purple-500";
    
    return <File className={`h-5 w-5 ${color}`} />;
  };

  const acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
    '.txt', '.md', '.csv', '.ppt', '.pptx',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ].join(',');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>上传文档到知识库</DialogTitle>
          <DialogDescription>
            上传文档到「{knowledgeBaseName}」，支持PDF、Word、Excel、TXT等格式
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/20 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">将文件拖放到此处或点击上传</h3>
            <p className="text-sm text-muted-foreground mb-4">
              支持PDF、Word、Excel、TXT等格式，单个文件最大50MB
            </p>
            
            <Button variant="outline" type="button">
              选择文件
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <Label className="text-base mb-2 block">已选择 {files.length} 个文件</Label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 border rounded-md bg-muted/20"
                  >
                    <div className="flex items-center truncate pr-2">
                      {getFileIcon(file)}
                      <span className="ml-2 truncate">{file.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center pt-2 text-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-muted-foreground">
              上传后，系统将自动处理文档并将内容添加到知识库，处理时间取决于文档大小和数量
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button 
            type="submit"
            onClick={handleUpload}
            disabled={files.length === 0 || isSubmitting}
          >
            {isSubmitting ? '上传中...' : '上传文档'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 