"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, RefreshCw, FileText, X } from "lucide-react";
import { KnowledgeBase } from "@/services/knowledgeBaseService";
import { formatDateTime } from "@/lib/utils";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: {
    title: string;
    content: string;
    page?: number;
  }[];
}

interface KnowledgeBaseChatProps {
  knowledgeBase: KnowledgeBase;
  onBack: () => void;
}

export default function KnowledgeBaseChat({ knowledgeBase, onBack }: KnowledgeBaseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSources, setShowSources] = useState<Record<string, boolean>>({});

  // 初始化对话
  useEffect(() => {
    // 初始系统消息
    const systemMessage: Message = {
      id: "system-1",
      role: "system",
      content: `这是一个基于"${knowledgeBase.name}"知识库的对话。如有问题，我将尽力从知识库中查找信息并给予回答。`,
      timestamp: new Date(),
    };

    // 初始助手问候消息
    const welcomeMessage: Message = {
      id: "assistant-1",
      role: "assistant",
      content: `您好！我是${knowledgeBase.name}知识库的AI助手。我可以回答与此知识库相关的问题，请问有什么可以帮助您的？`,
      timestamp: new Date(),
    };

    setMessages([systemMessage, welcomeMessage]);
    
    // 自动聚焦输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [knowledgeBase]);

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSourcesVisibility = (messageId: string) => {
    setShowSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 这里是模拟的响应，实际项目中应调用后端API
      await delay(1500);
      const response = await mockResponse(userMessage.content, knowledgeBase);
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("获取回答失败:", error);
      
      const errorMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: "抱歉，处理您的请求时出现错误。请稍后再试。",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    // 保留系统消息和初始欢迎消息
    setMessages(messages.slice(0, 2));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="border-b p-4 bg-background sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{knowledgeBase.name}</h2>
            <p className="text-sm text-muted-foreground">{knowledgeBase.description || "无描述"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat}>
          <RefreshCw className="h-4 w-4 mr-2" />
          清空对话
        </Button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.role !== "system").map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <CardContent className="p-3">
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* 来源信息 */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      size="sm"
                      className="p-0 h-auto text-xs"
                      onClick={() => toggleSourcesVisibility(message.id)}
                    >
                      {showSources[message.id] ? "隐藏来源" : "查看来源"}
                    </Button>

                    {showSources[message.id] && (
                      <div className="mt-2 space-y-2 border-t pt-2">
                        <p className="text-xs text-muted-foreground">来源文档:</p>
                        {message.sources.map((source, index) => (
                          <div key={index} className="bg-background rounded-sm p-2 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{source.title}</span>
                              {source.page && <Badge variant="outline" className="h-5">第 {source.page} 页</Badge>}
                            </div>
                            <p className="text-muted-foreground">{source.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {formatDateTime(message.timestamp)}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] bg-muted">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">AI正在思考...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4 bg-background sticky bottom-0">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="输入您的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none"
            rows={1}
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          AI助手基于知识库内容回答问题，如需更多帮助，请尽量描述详细的问题
        </p>
      </div>
    </div>
  );
}

// 辅助函数

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟响应生成
async function mockResponse(query: string, knowledgeBase: KnowledgeBase): Promise<Message> {
  // 简单的关键词匹配来生成模拟响应
  const normalizedQuery = query.toLowerCase();
  
  let content = "";
  let sources: Message["sources"] = [];
  
  // 匹配产品相关问题
  if (normalizedQuery.includes("产品") || normalizedQuery.includes("服务")) {
    content = "根据我们的知识库信息，我们提供多种产品和服务，包括AI对话系统、文档智能处理、自定义知识库解决方案等。每种产品都有详细的技术规格和用例说明。\n\n如果您需要特定产品的详细信息，可以告诉我产品名称，我会提供更具体的资料。";
    sources = [
      {
        title: "产品目录.pdf",
        content: "本公司提供多种AI驱动的产品和服务，包括对话系统、文档处理和知识库解决方案...",
        page: 3
      },
      {
        title: "服务手册.docx",
        content: "我们的服务范围包括产品咨询、定制开发、系统集成和技术支持...",
        page: 12
      }
    ];
  }
  // 匹配价格相关问题
  else if (normalizedQuery.includes("价格") || normalizedQuery.includes("费用") || normalizedQuery.includes("多少钱")) {
    content = "我们的产品价格体系采用灵活的订阅制模式，基础版每月299元起，专业版每月999元起，企业版则根据具体需求定制。所有版本都提供核心功能，高级版本增加了更多的使用限额和专属功能。\n\n详细的价格信息可以参考我们的官方价目表，或联系销售团队获取针对您具体需求的报价。";
    sources = [
      {
        title: "价格手册2023.pdf",
        content: "基础版：每月299元，包含5GB存储空间和1000次API调用...",
        page: 1
      }
    ];
  }
  // 匹配使用方法相关问题
  else if (normalizedQuery.includes("如何使用") || normalizedQuery.includes("使用方法") || normalizedQuery.includes("教程")) {
    content = "使用我们的系统非常简单，主要分为以下几个步骤：\n\n1. 创建账户并选择合适的套餐\n2. 创建知识库并上传文档\n3. 等待系统处理和索引文档\n4. 开始提问或集成API到您的应用\n\n我们提供详细的使用手册和视频教程，并有专业的客服团队随时提供支持。如果遇到任何问题，可以通过在线客服或电子邮件联系我们。";
    sources = [
      {
        title: "快速入门指南.pdf",
        content: "第一步：注册并验证您的账户...",
        page: 5
      },
      {
        title: "常见问题解答.md",
        content: "问：如何上传文档到知识库？答：在知识库详情页点击「上传文档」按钮...",
        page: 2
      }
    ];
  }
  // 默认回答
  else {
    content = `我理解您的问题是关于"${query}"。根据${knowledgeBase.name}知识库中的信息，我们目前没有直接相关的详细资料。您可以尝试用不同的方式描述您的问题，或者询问其他相关主题。我们的知识库内容会定期更新，以提供更全面的信息。`;
  }
  
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content,
    timestamp: new Date(),
    sources
  };
} 