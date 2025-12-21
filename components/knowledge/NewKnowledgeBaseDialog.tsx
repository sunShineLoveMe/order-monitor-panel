"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KnowledgeBase } from "@/lib/services/knowledgeBase";

interface NewKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Pick<KnowledgeBase, "name" | "description">) => void;
}

export default function NewKnowledgeBaseDialog({ 
  open, 
  onOpenChange,
  onSubmit 
}: NewKnowledgeBaseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: "", description: "" });

  const handleSubmit = async () => {
    // 简单的表单验证
    const newErrors = {
      name: name.trim() ? "" : "知识库名称不能为空",
      description: description.trim() ? "" : "知识库描述不能为空"
    };
    
    setErrors(newErrors);
    
    if (newErrors.name || newErrors.description) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 这里可以添加实际的API调用来创建知识库
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      onSubmit({
        name: name.trim(),
        description: description.trim()
      });
      
      // 重置表单
      setName("");
      setDescription("");
      setErrors({ name: "", description: "" });
    } catch (error) {
      console.error("创建知识库失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建新知识库</DialogTitle>
          <DialogDescription>
            创建一个新的知识库，上传文档并通过AI问答访问信息
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-left">
              知识库名称
            </Label>
            <Input
              id="name"
              placeholder="例如：产品手册、公司制度..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-left">
              知识库描述
            </Label>
            <Textarea
              id="description"
              placeholder="简要描述该知识库的内容和用途..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "创建中..." : "创建知识库"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 