"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";

export interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateKnowledgeBaseDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateKnowledgeBaseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("openai");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "请输入知识库名称",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await knowledgeBaseService.createKnowledgeBase({
        name,
        description,
        embeddingModel,
      });
      
      toast({
        title: "知识库创建成功",
        description: "您已成功创建知识库，现在您可以上传文档了",
      });
      
      // 清空表单
      setName("");
      setDescription("");
      setEmbeddingModel("openai");
      
      // 关闭对话框
      onOpenChange(false);
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("创建知识库失败:", error);
      toast({
        title: "创建知识库失败",
        description: "请稍后重试或联系管理员",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建新知识库</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">知识库名称 *</Label>
            <Input
              id="name"
              placeholder="输入知识库名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">知识库描述</Label>
            <Textarea
              id="description"
              placeholder="输入知识库描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="embeddingModel">嵌入模型</Label>
            <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
              <SelectTrigger>
                <SelectValue placeholder="选择嵌入模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI Embedding</SelectItem>
                <SelectItem value="huggingface">HuggingFace Embedding</SelectItem>
                <SelectItem value="local">本地 Embedding 模型</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              嵌入模型用于将文档内容转换为向量以实现语义检索
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "创建中..." : "创建知识库"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 