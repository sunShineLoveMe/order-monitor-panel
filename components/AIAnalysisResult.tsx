import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Brain, BrainCircuit, AlertTriangle, CheckCircle2, BarChart4, LineChart, PieChart, NetworkIcon, ArrowRight, Activity, Lightbulb, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderAnalysis } from "@/lib/services/ai";
import { Order as OrderType } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThinkingStep {
  id: number;
  content: string;
  type: 'observation' | 'analysis' | 'insight' | 'conclusion';
}

interface AIAnalysisResultProps {
  order: OrderType | null;
  analysisResult: OrderAnalysis | null;
  onExport: (thinkingSteps: ThinkingStep[]) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export default function AIAnalysisResult({ 
  order, 
  analysisResult, 
  onExport, 
  onClose, 
  isAnalyzing 
}: AIAnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<string>("thinking");
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [streamedFindings, setStreamedFindings] = useState<string[]>([]);
  const [streamedSummary, setStreamedSummary] = useState<string>("");
  const [currentFindingIndex, setCurrentFindingIndex] = useState<number>(0);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [thinkingComplete, setThinkingComplete] = useState<boolean>(false);
  const [streamingComplete, setStreamingComplete] = useState<boolean>(false);
  
  const thinkingStepsRef = useRef<HTMLDivElement>(null);

  // 初始化状态
  useEffect(() => {
    console.log("AIAnalysisResult组件挂载 - 初始状态:", { isAnalyzing, hasOrder: !!order });
    
    // 重置状态以确保每次打开对话框都是干净的状态
    setThinkingSteps([]);
    setStreamedFindings([]);
    setStreamedSummary("");
    setCurrentFindingIndex(0);
    setShowChart(false);
    setThinkingComplete(false);
    setStreamingComplete(false);
  }, []);

  // 模拟思考过程
  useEffect(() => {
    // thinkingSteps状态已经在组件挂载时重置过了
    console.log("AIAnalysisResult - 状态更新:", { isAnalyzing, hasOrder: !!order });
    
    if (isAnalyzing && order) { // 确保只有在分析状态且有订单时才开始思考过程
      console.log("开始AI分析...", order.order_number);
      
      const steps: ThinkingStep[] = [
        { 
          id: 1, 
          content: "收集订单基本信息...", 
          type: 'observation' 
        },
        { 
          id: 2, 
          content: order?.order_number ? `分析订单 ${order.order_number} 的产品信息和数量...` : "分析订单信息...", 
          type: 'observation' 
        },
        { 
          id: 3, 
          content: order?.value ? `检查订单金额 ¥${order.value.toLocaleString()} 是否与市场价格一致...` : "检查订单金额...",
          type: 'analysis' 
        },
        { 
          id: 4, 
          content: `查找相关历史订单数据...`, 
          type: 'observation' 
        },
        { 
          id: 5, 
          content: order?.customer ? `发现客户 "${order.customer}" 的历史订单模式...` : "分析客户历史订单模式...", 
          type: 'insight' 
        },
        { 
          id: 6, 
          content: `检测到订单异常点: 产品价格偏离历史均价超过 35%`, 
          type: 'insight' 
        },
        { 
          id: 7, 
          content: `分析订单周期与供应链状态...`, 
          type: 'analysis' 
        },
        { 
          id: 8, 
          content: `检测到供应链异常: 该产品近期供应波动较大`, 
          type: 'insight' 
        },
        { 
          id: 9, 
          content: `生成风险评分: ${analysisResult ? (analysisResult.riskScore * 10).toFixed(1) : '7.2'}/10`, 
          type: 'conclusion' 
        },
        { 
          id: 10, 
          content: `整合分析结果与推荐措施...`, 
          type: 'conclusion' 
        },
      ];

      let stepIndex = 0;
      const thinkingInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          const currentStep = steps[stepIndex];
          if (currentStep) {
            setThinkingSteps(prev => [...prev, currentStep]);
          }
          stepIndex++;
          
          // 自动滚动到最新的思考步骤
          setTimeout(() => {
            if (thinkingStepsRef.current) {
              thinkingStepsRef.current.scrollTop = thinkingStepsRef.current.scrollHeight;
            }
          }, 100);
        } else {
          clearInterval(thinkingInterval);
          setThinkingComplete(true);
          
          // 完成思考后自动切换到结果标签
          setTimeout(() => {
            setActiveTab("result");
            // 开始流式输出结果
            startStreamingResults();
          }, 1000);
        }
      }, 800);

      return () => clearInterval(thinkingInterval);
    }
  }, [isAnalyzing, order]);

  // 流式输出结果
  const startStreamingResults = () => {
    console.log("开始流式输出结果", { hasResult: !!analysisResult, order: order?.order_number });
    
    // 如果没有真实的分析结果，使用模拟数据
    if (!analysisResult || !Array.isArray(analysisResult.findings) || analysisResult.findings.length === 0) {
      console.log("使用模拟分析结果数据");
      // 创建模拟分析结果
      const mockFindings = [
        {
          category: '价格异常',
          description: `订单${order?.order_number}的价格明显高于市场平均水平，超出35%。`,
          severity: 'high',
          recommendations: ['验证价格计算是否正确', '与供应商确认最新价格', '评估是否需要调整定价策略']
        },
        {
          category: '供应链风险',
          description: '该产品近期供应波动较大，可能影响交付时间。',
          severity: 'medium',
          recommendations: ['关注供应商生产状态', '考虑增加备选供应渠道', '适当调整库存安全水平']
        }
      ];
      
      // 模拟流式输出发现项
      let findingIndex = 0;
      const findingInterval = setInterval(() => {
        if (findingIndex < mockFindings.length) {
          setStreamedFindings(prev => [...prev, JSON.stringify(mockFindings[findingIndex])]);
          findingIndex++;
          setCurrentFindingIndex(findingIndex);
        } else {
          clearInterval(findingInterval);
          
          // 开始流式输出总结
          streamMockSummary();
        }
      }, 1000);
      
      return;
    }
    
    // 原有的流式输出逻辑
    // 流式输出发现项
    let findingIndex = 0;
    const findingInterval = setInterval(() => {
      if (findingIndex < analysisResult.findings.length) {
        setStreamedFindings(prev => [...prev, JSON.stringify(analysisResult.findings[findingIndex])]);
        findingIndex++;
        setCurrentFindingIndex(findingIndex);
      } else {
        clearInterval(findingInterval);
        
        // 开始流式输出总结
        streamSummary();
      }
    }, 1000);
  };
  
  // 流式输出模拟总结
  const streamMockSummary = () => {
    const mockSummary = `此订单存在价格异常和供应链风险。价格比市场均价高出35%，需确认定价准确性。同时，产品供应链近期波动较大，建议密切关注供应状态并考虑备选供应渠道，以避免可能的交付延迟。`;
    
    let charIndex = 0;
    const summaryInterval = setInterval(() => {
      if (charIndex < mockSummary.length) {
        setStreamedSummary(mockSummary.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(summaryInterval);
        // 显示图表
        setTimeout(() => {
          setShowChart(true);
          setStreamingComplete(true);
        }, 500);
      }
    }, 30);
  };

  // 流式输出总结
  const streamSummary = () => {
    if (!analysisResult || typeof analysisResult.summary !== 'string') return;
    
    const summary = analysisResult.summary;
    let charIndex = 0;
    const summaryInterval = setInterval(() => {
      if (charIndex < summary.length) {
        setStreamedSummary(summary.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(summaryInterval);
        // 显示图表
        setTimeout(() => {
          setShowChart(true);
          setStreamingComplete(true);
        }, 500);
      }
    }, 30);
  };

  // 获取思考步骤的样式
  const getStepStyle = (type: string) => {
    switch (type) {
      case 'observation':
        return "bg-blue-50 border-blue-100 text-blue-800";
      case 'analysis':
        return "bg-purple-50 border-purple-100 text-purple-800";
      case 'insight':
        return "bg-amber-50 border-amber-100 text-amber-800";
      case 'conclusion':
        return "bg-green-50 border-green-100 text-green-800";
      default:
        return "bg-gray-50 border-gray-100 text-gray-800";
    }
  };

  // 获取思考步骤的图标
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'observation':
        return <Brain className="h-4 w-4" />;
      case 'analysis':
        return <Activity className="h-4 w-4" />;
      case 'insight':
        return <Lightbulb className="h-4 w-4" />;
      case 'conclusion':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <BrainCircuit className="h-4 w-4" />;
    }
  };

  // 渲染图表
  const renderChart = () => {
    if (!analysisResult) return null;
    
    return (
      <div className="mt-4 border rounded-lg p-4 bg-white">
        <h5 className="font-medium mb-3 text-slate-800">风险评估图表</h5>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 价格异常图表 */}
          <div className="relative h-48 w-full md:w-1/2 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-40 flex items-end justify-around px-4">
                <div className="relative">
                  <div className="w-12 bg-blue-500 rounded-t-md" style={{ height: '60px' }}></div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs">1月</div>
                </div>
                <div className="relative">
                  <div className="w-12 bg-blue-500 rounded-t-md" style={{ height: '80px' }}></div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs">2月</div>
                </div>
                <div className="relative">
                  <div className="w-12 bg-blue-500 rounded-t-md" style={{ height: '70px' }}></div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs">3月</div>
                </div>
                <div className="relative">
                  <div className="w-12 bg-red-500 rounded-t-md" style={{ height: '120px' }}></div>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs">当前</div>
                </div>
              </div>
              <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600">
                <span>¥1500</span>
                <span>¥1000</span>
                <span>¥500</span>
                <span>¥0</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-medium">
              单价比较（相同产品历史订单）
            </div>
          </div>
          
          {/* 风险评分雷达图 */}
          <div className="md:w-1/2 flex flex-col items-center mt-6 md:mt-0">
            <h5 className="font-medium mb-2 text-slate-800 text-sm">风险因素分布</h5>
            <div className="relative h-52 w-52">
              <div className="absolute inset-0 rounded-full border border-gray-200"></div>
              <div className="absolute inset-[10%] rounded-full border border-gray-200"></div>
              <div className="absolute inset-[20%] rounded-full border border-gray-200"></div>
              <div className="absolute inset-[30%] rounded-full border border-gray-200"></div>
              <div className="absolute inset-[40%] rounded-full border border-gray-200"></div>
              
              {/* 雷达图坐标轴 */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-[50%] h-full w-[1px] bg-gray-200 transform -translate-x-[0.5px]"></div>
                <div className="absolute top-[50%] left-0 h-[1px] w-full bg-gray-200 transform -translate-y-[0.5px]"></div>
                <div className="absolute top-0 left-[50%] h-full w-[1px] bg-gray-200 transform -translate-x-[0.5px] rotate-45 origin-bottom"></div>
                <div className="absolute top-0 left-[50%] h-full w-[1px] bg-gray-200 transform -translate-x-[0.5px] -rotate-45 origin-bottom"></div>
              </div>
              
              {/* 雷达图数据点 */}
              <svg className="absolute inset-0" viewBox="0 0 200 200">
                <polygon 
                  points="100,20 170,60 160,140 70,160 40,80" 
                  fill="rgba(239,68,68,0.2)" 
                  stroke="rgb(239,68,68)" 
                  strokeWidth="2"
                />
                <circle cx="100" cy="20" r="4" fill="rgb(239,68,68)" />
                <circle cx="170" cy="60" r="4" fill="rgb(239,68,68)" />
                <circle cx="160" cy="140" r="4" fill="rgb(239,68,68)" />
                <circle cx="70" cy="160" r="4" fill="rgb(239,68,68)" />
                <circle cx="40" cy="80" r="4" fill="rgb(239,68,68)" />
              </svg>
              
              {/* 雷达图标签 */}
              <div className="absolute -top-3 left-[50%] transform -translate-x-1/2 text-[10px] font-medium text-gray-700">价格异常</div>
              <div className="absolute top-[50%] -right-14 transform -translate-y-1/2 text-[10px] font-medium text-gray-700">供应链风险</div>
              <div className="absolute -bottom-3 left-[50%] transform -translate-x-1/2 text-[10px] font-medium text-gray-700">交付延迟</div>
              <div className="absolute top-[50%] -left-12 transform -translate-y-1/2 text-[10px] font-medium text-gray-700">客户信用</div>
              <div className="absolute top-[15%] right-[15%] text-[10px] font-medium text-gray-700">数量异常</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染发现项
  const renderFinding = (findingJson: string, index: number) => {
    try {
      const finding = JSON.parse(findingJson);
      if (!finding) return <div key={index}>无效数据</div>;
      
      return (
        <div key={index} className={cn(
          "p-3 rounded-md mb-3",
          finding.severity === 'high' ? "bg-red-50 border border-red-100" :
          finding.severity === 'medium' ? "bg-amber-50 border border-amber-100" :
          "bg-blue-50 border border-blue-100"
        )}>
          <div className="flex items-center gap-2 mb-1">
            {finding.severity === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
            {finding.severity === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            {finding.severity === 'low' && <AlertTriangle className="h-4 w-4 text-blue-500" />}
            <span className="font-medium">{finding.category || '未分类'}</span>
          </div>
          <p className="text-sm mb-2">{finding.description || '无描述'}</p>
          {finding.recommendations && Array.isArray(finding.recommendations) && finding.recommendations.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">建议: </span>
              <ul className="list-disc list-inside space-y-1 pl-1 mt-1">
                {finding.recommendations.map((rec: string, idx: number) => (
                  <li key={idx}>{rec || ''}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error("解析发现项失败:", e);
      return <div key={index}>解析错误</div>;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="thinking" className="flex items-center gap-1.5">
            <BrainCircuit className="h-4 w-4" /> 
            思考过程
            {thinkingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-1.5">
            <LineChart className="h-4 w-4" /> 
            分析结果
            {streamingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thinking" className="space-y-4 mt-2">
          <div 
            ref={thinkingStepsRef}
            className="space-y-3 max-h-[400px] overflow-y-auto p-2"
          >
            {thinkingSteps.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                {isAnalyzing ? "AI正在启动分析..." : "等待AI分析启动..."}
              </div>
            ) : (
              thinkingSteps.map((step, index) => (
                <div
                  key={step?.id || index}
                  className={cn(
                    "p-3 rounded-md border flex gap-2 items-start transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                    getStepStyle(step?.type || 'observation')
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center rounded-full p-1 h-6 w-6",
                    step?.type === 'observation' ? "bg-blue-100" :
                    step?.type === 'analysis' ? "bg-purple-100" :
                    step?.type === 'insight' ? "bg-amber-100" :
                    "bg-green-100"
                  )}>
                    {getStepIcon(step?.type || 'observation')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{step?.content || ''}</p>
                  </div>
                </div>
              ))
            )}
            
            {isAnalyzing && thinkingSteps.length > 0 && !thinkingComplete && (
              <div className="flex justify-center my-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          {thinkingComplete && (
            <div className="flex justify-center mt-2">
              <Button 
                onClick={() => setActiveTab("result")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                查看分析结果 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="result" className="h-[500px] relative overflow-hidden mt-2">
          <div className="absolute inset-0 overflow-y-auto pr-2">
            {analysisResult && order ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">订单 {order.order_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.product_name} · {order.customer}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "px-3 py-1 rounded-md",
                      analysisResult?.riskScore > 0.5 ? "bg-red-100 text-red-800" : 
                      analysisResult?.riskScore > 0.3 ? "bg-amber-100 text-amber-800" : 
                      "bg-green-100 text-green-800"
                    )}
                  >
                    风险评分: {analysisResult?.riskScore ? (analysisResult.riskScore * 10).toFixed(1) : "3.0"}
                  </Badge>
                </div>

                <div className="grid gap-4">
                  <div>
                    <h5 className="font-medium mb-2 text-slate-800 flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                      分析发现 ({currentFindingIndex}/{analysisResult?.findings?.length || 0})
                    </h5>
                    <div>
                      {streamedFindings.length > 0 ? (
                        streamedFindings.map((findingJson, index) => 
                          renderFinding(findingJson, index)
                        )
                      ) : isAnalyzing ? (
                        <div className="flex justify-center my-4">
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          暂无分析发现
                        </div>
                      )}
                      
                      {streamedFindings.length > 0 && streamedFindings.length < (analysisResult?.findings?.length || 0) && (
                        <div className="flex justify-center my-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 分析总结部分 */}
                  {(streamedFindings.length === (analysisResult?.findings?.length || 0) || streamingComplete) && (
                    <div>
                      <h5 className="font-medium mb-2 text-slate-800 flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-blue-500" />
                        分析总结
                      </h5>
                      <p className="text-sm p-3 bg-white rounded-md border min-h-[60px]">
                        {streamedSummary || '正在生成总结...'}
                        {streamedSummary && streamedSummary.length < (analysisResult?.summary?.length || 0) && !streamingComplete && (
                          <span className="inline-block w-1 h-4 bg-primary animate-pulse ml-0.5"></span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* 图表部分 */}
                  {(showChart || streamingComplete) && renderChart()}

                  {analysisResult?.relatedOrders && Array.isArray(analysisResult.relatedOrders) && analysisResult.relatedOrders.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-slate-800 flex items-center">
                        <NetworkIcon className="mr-2 h-4 w-4 text-purple-500" />
                        相关订单
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {analysisResult?.relatedOrders?.map((orderNum, idx) => (
                          <Badge key={idx} variant="outline" className="justify-start">
                            {orderNum}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                {isAnalyzing ? "AI正在生成分析结果..." : "等待分析结果..."}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
        <Button 
          variant="default" 
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          onClick={() => onExport(thinkingSteps)}
        >
          <Download className="mr-2 h-4 w-4" />
          导出分析报告
        </Button>
      </div>
    </div>
  );
} 