"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User, Sparkles, Copy, Check, FileText, ExternalLink } from "lucide-react";
import { KnowledgeBase } from "./KnowledgeBaseList";

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

interface Source {
  id: string;
  name: string;
  content: string;
  relevance: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
  thinking?: string;
}

interface KnowledgeBaseChatProps {
  knowledgeBaseId: string;
  onBack: () => void;
}

export default function KnowledgeBaseChat({ 
  knowledgeBaseId, 
  onBack 
}: KnowledgeBaseChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 获取知识库信息
  const knowledgeBase = mockKnowledgeBases[knowledgeBaseId];
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // 调整文本域高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 根据不同知识库生成不同的模拟回复
      let responseContent = '';
      let sources: Source[] = [];
      let thinking = '';
      
      if (knowledgeBaseId === 'kb-001') {
        responseContent = `根据产品知识库，我可以为您提供以下信息：\n\n您询问的产品规格是高度45cm，宽度30cm，深度20cm，重量约2.5kg。该产品支持WiFi和蓝牙连接，电池续航时间约8小时。\n\n产品保修期为自购买之日起12个月，如有任何质量问题，可联系我们的售后服务部门。`;
        sources = [
          {
            id: 'src-001',
            name: '产品规格说明书v2.0.pdf',
            content: '产品尺寸：高度45cm，宽度30cm，深度20cm，重量约2.5kg。连接方式：支持WiFi 802.11 a/b/g/n/ac和蓝牙5.0。',
            relevance: 0.95
          },
          {
            id: 'src-002',
            name: '用户操作手册.docx',
            content: '电池续航时间约8小时，视使用场景可能有所差异。产品包含一年保修服务，自购买之日起计算。',
            relevance: 0.87
          }
        ];
        thinking = `分析用户问题：用户询问产品规格信息。

步骤1：搜索知识库中的产品规格相关文档
- 找到了"产品规格说明书v2.0.pdf"，包含产品的物理尺寸和连接方式
- 找到了"用户操作手册.docx"，包含电池续航和保修信息

步骤2：整合信息
- 从"产品规格说明书"获取尺寸、重量和连接方式
- 从"用户操作手册"获取电池续航和保修信息

步骤3：形成回答
- 结构化回答，包含产品物理规格、连接功能、电池续航和保修信息
- 回答覆盖用户可能需要的主要规格信息`;
      } else if (knowledgeBaseId === 'kb-002') {
        responseContent = `根据我们的供应商管理手册，新供应商评估流程包括以下步骤：\n\n1. 初步资格审核：检查基本资质和合规文件\n2. 实地考察：评估生产能力和质量控制\n3. 样品评估：对提供样品进行质量测试\n4. 价格谈判：确定初步价格范围\n5. 小批量试产：评估实际生产能力\n6. 最终审批：由采购委员会最终审批\n\n整个评估周期通常需要4-6周时间。`;
        sources = [
          {
            id: 'src-003',
            name: '供应商评估标准.xlsx',
            content: '供应商评估包括六个步骤：初步资格审核、实地考察、样品评估、价格谈判、小批量试产和最终审批。',
            relevance: 0.97
          },
          {
            id: 'src-004',
            name: '采购流程指南.pdf',
            content: '新供应商评估周期通常需要4-6周时间，取决于供应商响应速度和评估结果。如需加急评估，请提前两周与采购经理沟通。',
            relevance: 0.85
          }
        ];
        thinking = `分析用户问题：用户询问新供应商评估流程。

步骤1：查找相关供应商评估文档
- 找到"供应商评估标准.xlsx"，包含评估步骤信息
- 找到"采购流程指南.pdf"，包含评估周期时间

步骤2：提取评估流程步骤
- 确认评估包含六个关键步骤
- 每个步骤的具体内容都在文档中有描述

步骤3：确认时间周期
- 从"采购流程指南"中确认评估周期为4-6周

步骤4：组织回答
- 按顺序列出六个评估步骤
- 包含每个步骤的简要说明
- 补充评估周期信息`;
      } else if (knowledgeBaseId === 'kb-003') {
        responseContent = `根据员工培训材料，新员工入职流程如下：\n\n第一天：\n- 人事部门办理入职手续\n- IT部门配置账号和设备\n- 部门主管进行工作介绍\n\n第一周：\n- 参加公司文化培训\n- 完成安全和合规培训\n- 与团队成员会面\n\n第一个月：\n- 完成岗位技能培训\n- 参与第一个项目\n- 与直属上级进行首次绩效沟通\n\n三个月试用期结束前，将进行试用期评估面谈。`;
        sources = [
          {
            id: 'src-005',
            name: '新员工入职手册.pdf',
            content: '新员工入职第一天需完成人事手续办理、IT账号配置和部门工作介绍。第一周需完成公司文化培训、安全合规培训和团队熟悉。',
            relevance: 0.98
          }
        ];
        thinking = `分析用户问题：用户询问新员工入职流程。

步骤1：查找相关入职流程文档
- 找到"新员工入职手册.pdf"，包含详细的入职流程

步骤2：整理入职流程时间线
- 确认入职流程分为第一天、第一周、第一个月和三个月四个时间段
- 每个时间段有不同的关键任务和流程

步骤3：提取每个阶段的关键活动
- 第一天：人事手续、IT设置、工作介绍
- 第一周：文化培训、安全培训、团队熟悉
- 第一个月：技能培训、首个项目、绩效沟通
- 三个月：试用期评估

步骤4：组织回答
- 按时间顺序组织入职流程
- 每个时间段列出关键活动
- 确保信息清晰易懂`;
      } else {
        responseContent = `根据仓储操作指南，库存盘点流程包括以下步骤：\n\n1. 盘点准备：确定盘点时间，准备盘点表\n2. 系统冻结：暂停所有入库和出库操作\n3. 实物盘点：由两人一组进行实物数量清点\n4. 数据录入：将盘点结果录入系统\n5. 差异分析：比对实际库存与系统记录的差异\n6. 差异处理：调查并解释出现差异的原因\n7. 系统调整：根据实际情况调整系统库存数据\n8. 盘点报告：生成最终盘点报告并归档\n\n根据规定，全面盘点每季度进行一次，部分重点物品每月盘点一次。`;
        sources = [
          {
            id: 'src-006',
            name: '仓库安全管理规范.pdf',
            content: '库存盘点应遵循"双人确认"原则，由两人一组进行实物数量清点，确保盘点准确性。全面盘点每季度进行一次，部分重点物品每月盘点一次。',
            relevance: 0.92
          }
        ];
        thinking = `分析用户问题：用户询问库存盘点流程。

步骤1：查找库存盘点相关文档
- 找到"仓库安全管理规范.pdf"，包含盘点流程和频率信息

步骤2：提取盘点流程步骤
- 确认盘点流程包含8个关键步骤
- 从准备阶段到最终报告归档的完整流程

步骤3：确认盘点频率和特殊要求
- 全面盘点：每季度一次
- 重点物品：每月一次
- 特殊要求："双人确认"原则

步骤4：组织回答
- 按顺序列出8个盘点步骤
- 每个步骤包含简要说明
- 补充盘点频率信息`;
      }
      
      const botMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        sources,
        thinking
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };
  
  const toggleThinking = (messageId: string) => {
    setShowThinking(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-220px)]">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          与「{knowledgeBase.name}」对话
        </h2>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>知识库问答</CardTitle>
          <CardDescription>
            基于知识库内容进行问答，引用的来源信息可点击查看
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Sparkles className="h-12 w-12 text-primary/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">开始与知识库对话</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                您可以询问与「{knowledgeBase.name}」相关的任何问题，AI将根据知识库内容为您解答
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-6 w-full max-w-md">
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={() => setInputMessage('这个知识库包含哪些内容？')}
                >
                  <span>这个知识库包含哪些内容？</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={() => setInputMessage('如何查找特定文档？')}
                >
                  <span>如何查找特定文档？</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={() => setInputMessage('能给我最新更新的信息吗？')}
                >
                  <span>能给我最新更新的信息吗？</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={() => setInputMessage('请概述主要流程和规范')}
                >
                  <span>请概述主要流程和规范</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div className={`space-y-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`px-4 py-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {/* 来源引用 */}
                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <div className="space-y-2 px-1">
                          <p className="text-xs text-muted-foreground">
                            来源文档：
                          </p>
                          <div className="space-y-1.5">
                            {message.sources.map((source) => (
                              <div 
                                key={source.id}
                                className="flex items-center gap-2 text-xs p-2 rounded border bg-background hover:bg-muted/30 transition-colors cursor-pointer"
                                onClick={() => {
                                  // 实际实现应打开文档详情
                                  console.log('查看文档来源:', source.id);
                                }}
                              >
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                <div className="flex-1 truncate">
                                  <div className="font-medium truncate">{source.name}</div>
                                  <div className="text-muted-foreground truncate">{source.content.substring(0, 60)}...</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 思考过程 */}
                      {message.role === 'assistant' && message.thinking && (
                        <div className="px-1">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleThinking(message.id)}
                          >
                            {showThinking[message.id] ? '隐藏思考过程' : '查看思考过程'}
                          </Button>
                          
                          {showThinking[message.id] && (
                            <div className="mt-2 p-3 text-xs bg-muted/50 border rounded-md whitespace-pre-wrap">
                              {message.thinking}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground justify-end">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-muted">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <div className="flex items-end w-full gap-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="输入问题，回车发送..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              className="h-[60px]"
              disabled={!inputMessage.trim() || isLoading}
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 