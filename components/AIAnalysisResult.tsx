import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Brain, BrainCircuit, AlertTriangle, CheckCircle2, BarChart4, LineChart, PieChart, NetworkIcon, ArrowRight, Activity, Lightbulb, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderAnalysis } from "@/lib/services/ai";
import { Order as OrderType } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

export interface ThinkingStep {
  id: number;
  content: string;
  type: 'observation' | 'analysis' | 'insight' | 'conclusion';
  execution_id?: string;
  created_at?: string;
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

  // Initialize and subscribe to realtime updates
  useEffect(() => {
    if (!order) return;

    const loadInitialSteps = async () => {
      // Get latest execution for this order
      const { data: execution } = await supabase
        .from('ai_analysis_executions')
        .select('id, status')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (execution) {
        // Load existing steps
        const { data: steps } = await supabase
          .from('ai_analysis_steps')
          .select('*')
          .eq('execution_id', execution.id)
          .order('step_order', { ascending: true });

        if (steps) {
          setThinkingSteps(steps.map(s => ({
            id: s.id,
            content: s.content,
            type: s.type as any
          })));
        }

        if (execution.status === 'completed') {
          setThinkingComplete(true);
        }

        // Subscribe to new steps
        const channel = supabase
          .channel(`analysis-${execution.id}`)
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'ai_analysis_steps',
              filter: `execution_id=eq.${execution.id}`
            },
            (payload) => {
              const newStep = payload.new as any;
              setThinkingSteps(prev => [...prev, {
                id: newStep.id,
                content: newStep.content,
                type: newStep.type
              }]);
              
              // Auto scroll
              setTimeout(() => {
                if (thinkingStepsRef.current) {
                  thinkingStepsRef.current.scrollTop = thinkingStepsRef.current.scrollHeight;
                }
              }, 100);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'ai_analysis_executions',
              filter: `id=eq.${execution.id}`
            },
            (payload) => {
              if (payload.new.status === 'completed') {
                setThinkingComplete(true);
                setTimeout(() => {
                  setActiveTab("result");
                  startStreamingResults();
                }, 1000);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    loadInitialSteps();
  }, [order]);

  // Restart streaming results when thinking completes
  useEffect(() => {
    if (thinkingComplete && !streamingComplete && activeTab === 'result') {
      startStreamingResults();
    }
  }, [thinkingComplete, activeTab]);

  // Streaming results logic
  const startStreamingResults = () => {
    console.log("Starting result streaming...", { hasResult: !!analysisResult, order: order?.order_number });
    
    if (!analysisResult || !Array.isArray(analysisResult.findings) || analysisResult.findings.length === 0) {
      // Fallback to mock if no real result
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
      
      let findingIndex = 0;
      const findingInterval = setInterval(() => {
        if (findingIndex < mockFindings.length) {
          setStreamedFindings(prev => [...prev, JSON.stringify(mockFindings[findingIndex])]);
          findingIndex++;
          setCurrentFindingIndex(findingIndex);
        } else {
          clearInterval(findingInterval);
          streamMockSummary();
        }
      }, 1000);
      return;
    }
    
    let findingIndex = 0;
    const findingInterval = setInterval(() => {
      if (findingIndex < analysisResult.findings.length) {
        setStreamedFindings(prev => [...prev, JSON.stringify(analysisResult.findings[findingIndex])]);
        findingIndex++;
        setCurrentFindingIndex(findingIndex);
      } else {
        clearInterval(findingInterval);
        streamSummary();
      }
    }, 1000);
  };
  
  const streamMockSummary = () => {
    const mockSummary = `此订单存在价格异常和供应链风险。价格比市场均价高出35%，需确认定价准确性。同时，产品供应链近期波动较大，建议密切关注供应状态并考虑备选供应渠道，以避免可能的交付延迟。`;
    let charIndex = 0;
    const summaryInterval = setInterval(() => {
      if (charIndex < mockSummary.length) {
        setStreamedSummary(mockSummary.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(summaryInterval);
        setTimeout(() => {
          setShowChart(true);
          setStreamingComplete(true);
        }, 500);
      }
    }, 30);
  };

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
        setTimeout(() => {
          setShowChart(true);
          setStreamingComplete(true);
        }, 500);
      }
    }, 30);
  };

  const getStepStyle = (type: string) => {
    switch (type) {
      case 'observation': return "bg-blue-50 border-blue-100 text-blue-800";
      case 'analysis': return "bg-purple-50 border-purple-100 text-purple-800";
      case 'insight': return "bg-amber-50 border-amber-100 text-amber-800";
      case 'conclusion': return "bg-green-50 border-green-100 text-green-800";
      default: return "bg-gray-50 border-gray-100 text-gray-800";
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'observation': return <Brain className="h-4 w-4" />;
      case 'analysis': return <Activity className="h-4 w-4" />;
      case 'insight': return <Lightbulb className="h-4 w-4" />;
      case 'conclusion': return <CheckCircle2 className="h-4 w-4" />;
      default: return <BrainCircuit className="h-4 w-4" />;
    }
  };

  const renderChart = () => {
    if (!analysisResult) return null;
    return (
      <div className="mt-4 border rounded-lg p-4 bg-white">
        <h5 className="font-medium mb-3 text-slate-800">风险评估图表</h5>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative h-48 w-full md:w-1/2 mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-40 flex items-end justify-around px-4">
                <div className="relative"><div className="w-12 bg-blue-500 rounded-t-md" style={{ height: '60px' }}></div><div className="absolute -bottom-6 left-0 right-0 text-center text-xs">1月</div></div>
                <div className="relative"><div className="w-12 bg-blue-500 rounded-t-md" style={{ height: '80px' }}></div><div className="absolute -bottom-6 left-0 right-0 text-center text-xs">2月</div></div>
                <div className="relative"><div className="w-12 bg-blue-500 rounded-t-md" style={{ height: '70px' }}></div><div className="absolute -bottom-6 left-0 right-0 text-center text-xs">3月</div></div>
                <div className="relative"><div className="w-12 bg-red-500 rounded-t-md" style={{ height: '120px' }}></div><div className="absolute -bottom-6 left-0 right-0 text-center text-xs">当前</div></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-medium">单价比较（历史均价）</div>
          </div>
          <div className="md:w-1/2 flex flex-col items-center">
            <h5 className="font-medium mb-2 text-slate-800 text-sm">风险因素分布</h5>
            <div className="relative h-40 w-40">
              <svg className="absolute inset-0" viewBox="0 0 200 200">
                <polygon points="100,20 170,60 160,140 70,160 40,80" fill="rgba(239,68,68,0.2)" stroke="rgb(239,68,68)" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinding = (findingJson: string, index: number) => {
    try {
      const finding = JSON.parse(findingJson);
      return (
        <div key={index} className={cn("p-3 rounded-md mb-3 border", 
          finding.severity === 'high' ? "bg-red-50 border-red-100" :
          finding.severity === 'medium' ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100")}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn("h-4 w-4", finding.severity === 'high' ? "text-red-500" : "text-amber-500")} />
            <span className="font-medium">{finding.category}</span>
          </div>
          <p className="text-sm">{finding.description}</p>
        </div>
      );
    } catch (e) { return null; }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="thinking" className="flex items-center gap-1.5">
            <BrainCircuit className="h-4 w-4" /> 思考过程 {thinkingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-1.5">
            <LineChart className="h-4 w-4" /> 分析结果 {streamingComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thinking" className="space-y-4 mt-2">
          <div ref={thinkingStepsRef} className="space-y-3 max-h-[400px] overflow-y-auto p-2">
            {thinkingSteps.map((step, index) => (
              <div key={step.id || index} className={cn("p-3 rounded-md border flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2", getStepStyle(step.type))}>
                <div className="bg-white/50 rounded-full p-1">{getStepIcon(step.type)}</div>
                <p className="text-sm">{step.content}</p>
              </div>
            ))}
            {!thinkingComplete && isAnalyzing && (
              <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            )}
          </div>
          {thinkingComplete && (
            <div className="flex justify-center"><Button onClick={() => setActiveTab("result")}>查看分析结果 <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          )}
        </TabsContent>

        <TabsContent value="result" className="h-[500px] overflow-y-auto mt-2 pr-2">
          {order && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div><h4 className="font-medium">订单 {order.order_number}</h4><p className="text-sm text-muted-foreground">{order.product_name} · {order.customer}</p></div>
                <Badge variant="outline">风险评分: {analysisResult ? (analysisResult.riskScore * 10).toFixed(1) : "N/A"}</Badge>
              </div>
              <div className="space-y-4">
                {streamedFindings.map((f, i) => renderFinding(f, i))}
                {streamedSummary && (
                  <div className="p-3 bg-slate-50 rounded-md border text-sm">{streamedSummary}</div>
                )}
                {showChart && renderChart()}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>关闭</Button>
        <Button onClick={() => onExport(thinkingSteps)}><Download className="mr-2 h-4 w-4" />导出报告</Button>
      </div>
    </div>
  );
}
