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
  const [fetchedAnalysisResult, setFetchedAnalysisResult] = useState<OrderAnalysis | null>(null);
  
  const activeResult = fetchedAnalysisResult || analysisResult;
  const thinkingStepsRef = useRef<HTMLDivElement>(null);

  // Initialize and subscribe to realtime updates
  useEffect(() => {
    setActiveTab("thinking");
    setThinkingSteps([]);
    setStreamedFindings([]);
    setStreamedSummary("");
    setThinkingComplete(false);
    setStreamingComplete(false);
    setFetchedAnalysisResult(null);
    
    if (!order) return;

    let cleanupFn: (() => void) | undefined;

    const fetchResult = async (executionId: string) => {
      console.log("Fetching result for execution:", executionId);
      // 1. Try to fetch detailed results
      const { data: resultData } = await supabase
        .from('ai_analysis_results')
        .select('*')
        .eq('execution_id', executionId)
        .maybeSingle();
      
      // 2. Try to fetch baseline result from execution
      const { data: execData } = await supabase
        .from('ai_analysis_executions')
        .select('result_summary, risk_score')
        .eq('id', executionId)
        .single();
      
      const summary = resultData?.root_cause || execData?.result_summary || "";
      const rawRiskScore = resultData?.risk_level === 'high' ? 0.9 : 
                         (resultData?.risk_level === 'medium' ? 0.5 : 
                         (resultData?.risk_level === 'low' ? 0.2 : 
                         (execData?.risk_score ? Number(execData.risk_score) / 10 : 0)));

      const normalizedRiskScore = rawRiskScore > 1 ? rawRiskScore / 10 : rawRiskScore;

      let findings = resultData?.solutions || [];
      if (findings.length === 0 && summary) {
        findings = [{
          category: '机理分析',
          description: summary,
          severity: normalizedRiskScore > 0.7 ? 'high' : (normalizedRiskScore > 0.4 ? 'medium' : 'low'),
          recommendations: ['执行专家复核流程', '核对交易报文有效性']
        }];
      }
      
      if (summary || findings.length > 0) {
        console.log("Setting fetched result:", { summary, findings: findings.length, riskScore: normalizedRiskScore });
        setFetchedAnalysisResult({
          orderId: order.id,
          order_number: order.order_number,
          analysis_type: order.type as any,
          findings: findings,
          summary: summary,
          riskScore: normalizedRiskScore,
          relatedOrders: []
        });
      }
    };

    const setupExecutionSubscription = (executionId: string) => {
      console.log("Setting up subscriptions for execution:", executionId);
      
      // Load existing steps
      supabase
        .from('ai_analysis_steps')
        .select('*')
        .eq('execution_id', executionId)
        .order('step_order', { ascending: true })
        .then(({ data: steps }) => {
          if (steps && steps.length > 0) {
            console.log("Loaded existing steps:", steps.length);
            setThinkingSteps(steps.map(s => ({
              id: s.id,
              content: s.content,
              type: s.type as any
            })));
          }
        });

      // Check current execution status
      supabase
        .from('ai_analysis_executions')
        .select('status')
        .eq('id', executionId)
        .single()
        .then(({ data: exec }) => {
          if (exec?.status === 'completed') {
            console.log("Execution already completed, fetching result");
            setThinkingComplete(true);
            fetchResult(executionId);
          }
        });

      // Subscribe to new steps
      const channel = supabase
        .channel(`analysis-${executionId}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'ai_analysis_steps',
            filter: `execution_id=eq.${executionId}`
          },
          (payload) => {
            const newStep = payload.new as any;
            console.log("New step received:", newStep.type);
            setThinkingSteps(prev => [...prev, {
              id: newStep.id,
              content: newStep.content,
              type: newStep.type
            }]);
            
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
            filter: `id=eq.${executionId}`
          },
          (payload) => {
            console.log("Execution status update:", payload.new.status);
            if (payload.new.status === 'completed') {
              setThinkingComplete(true);
              fetchResult(executionId);
              setTimeout(() => {
                setActiveTab("result");
                startStreamingResults();
              }, 1000);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ai_analysis_results',
            filter: `execution_id=eq.${executionId}`
          },
          () => {
            console.log("Detailed results arrived");
            fetchResult(executionId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const loadInitialSteps = async () => {
      console.log("Loading initial steps for order:", order.id);
      
      // First try to use executionId from prop if available
      const propExecutionId = analysisResult?.executionId;
      if (propExecutionId) {
        console.log("Using executionId from prop:", propExecutionId);
        cleanupFn = setupExecutionSubscription(propExecutionId);
        return;
      }
      
      // Otherwise query for latest execution
      const { data: execution } = await supabase
        .from('ai_analysis_executions')
        .select('id, status')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (execution) {
        console.log("Found existing execution:", execution.id);
        cleanupFn = setupExecutionSubscription(execution.id);
      } else {
        console.log("No execution found, subscribing to new executions");
        // Subscribe to new executions for this order
        const newExecChannel = supabase
          .channel(`new-exec-${order.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ai_analysis_executions',
              filter: `order_id=eq.${order.id}`
            },
            (payload) => {
              console.log("New execution created:", payload.new.id);
              supabase.removeChannel(newExecChannel);
              cleanupFn = setupExecutionSubscription(payload.new.id);
            }
          )
          .subscribe();
        
        cleanupFn = () => {
          supabase.removeChannel(newExecChannel);
        };
      }
    };

    loadInitialSteps();
    
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [order, analysisResult?.executionId]);

  // Restart streaming results when thinking completes
  useEffect(() => {
    if (thinkingComplete && !streamingComplete && activeTab === 'result') {
      startStreamingResults();
    }
  }, [thinkingComplete, activeTab]);

  // Streaming results logic
  const startStreamingResults = () => {
    console.log("Starting result streaming...", { hasResult: !!activeResult, order: order?.order_number });
    
    if (!activeResult || !Array.isArray(activeResult.findings) || activeResult.findings.length === 0) {
      console.log("Waiting for real findings from database...");
      return;
    }
    
    let findingIndex = 0;
    const findingInterval = setInterval(() => {
      if (findingIndex < activeResult!.findings.length) {
        setStreamedFindings(prev => [...prev, JSON.stringify(activeResult!.findings[findingIndex])]);
        findingIndex++;
        setCurrentFindingIndex(findingIndex);
      } else {
        clearInterval(findingInterval);
        streamSummary();
      }
    }, 1000);
  };
  

  const streamSummary = () => {
    if (!activeResult || typeof activeResult.summary !== 'string') return;
    const summary = activeResult.summary;
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
      case 'observation': return "bg-blue-500/20 border-blue-500/40 text-blue-100 font-mono shadow-[0_0_10px_rgba(59,130,246,0.1)]";
      case 'analysis': return "bg-purple-500/20 border-purple-500/40 text-purple-100 font-mono shadow-[0_0_10px_rgba(168,85,247,0.1)]";
      case 'insight': return "bg-amber-500/20 border-amber-500/40 text-amber-100 font-mono shadow-[0_0_10px_rgba(245,158,11,0.1)]";
      case 'conclusion': return "bg-emerald-500/20 border-emerald-500/40 text-emerald-100 font-mono shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      default: return "bg-slate-500/20 border-slate-500/40 text-slate-100 font-mono";
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
    if (!activeResult) return null;
    return (
      <div className="mt-4 border border-slate-800 rounded-xl p-6 bg-black/30 backdrop-blur-md shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-30 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <h5 className="font-bold mb-6 text-slate-300 text-xs uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3 text-blue-400" />
          多维风险拓扑推演
        </h5>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative h-56 w-full md:w-1/2 mb-4 group/chart">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-44 flex items-end justify-around px-4">
                {[
                  { label: 'T-3', val: 60, color: 'bg-blue-500/40' },
                  { label: 'T-2', val: 80, color: 'bg-blue-500/50' },
                  { label: 'T-1', val: 70, color: 'bg-blue-500/60' },
                  { label: 'NOW', val: 130, color: 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' }
                ].map((item, id) => (
                  <div key={id} className="relative group/bar flex flex-col items-center">
                    <div 
                      className={cn("w-10 rounded-t-lg transition-all duration-700 ease-out delay-100 group-hover/chart:opacity-100", item.color)} 
                      style={{ height: showChart ? `${item.val}px` : '0px' }}
                    >
                      <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-mono text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        ¥{(item.val * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-slate-600 uppercase tracking-tighter">SKU 价格波动曲线 (历史同期)</div>
          </div>
          <div className="md:w-1/2 flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/5">
            <h5 className="font-bold mb-4 text-slate-400 text-[10px] uppercase tracking-widest">因果关联概率场</h5>
            <div className="relative h-44 w-44">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border border-slate-700 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute w-24 h-24 border border-slate-800 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              </div>
              <svg className="absolute inset-0 drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]" viewBox="0 0 200 200">
                <defs>
                   <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="rgba(239,68,68,0.5)" />
                     <stop offset="100%" stopColor="rgba(147,51,234,0.5)" />
                   </linearGradient>
                </defs>
                <polygon 
                  points="100,30 160,70 140,150 60,160 30,80" 
                  fill="url(#riskGrad)" 
                  stroke="rgba(239,68,68,0.8)" 
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {[30, 70, 150, 160, 80].map((v, i) => {
                  const angles = [0, 72, 144, 216, 288];
                  return <circle key={i} cx={100 + Math.cos(angles[i]*Math.PI/180) * (v-10)} cy={100 + Math.sin(angles[i]*Math.PI/180) * (v-10)} r="2" fill="white" className="animate-ping" style={{ animationDuration: `${2+i}s` }} />
                })}
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4">
               {['供给', '物流', '人力', '资金'].map(label => (
                 <div key={label} className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                   <span className="text-[10px] text-slate-500">{label}风险</span>
                 </div>
               ))}
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
        <div key={index} className={cn(
          "p-4 rounded-xl mb-3 border backdrop-blur-md transition-all duration-300 hover:scale-[1.01]", 
          finding.severity === 'high' ? "bg-red-500/10 border-red-500/30 text-red-200" :
          finding.severity === 'medium' ? "bg-amber-500/10 border-amber-500/30 text-amber-200" : "bg-blue-500/10 border-blue-500/30 text-blue-200")}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "p-1.5 rounded-lg",
              finding.severity === 'high' ? "bg-red-500/20" :
              finding.severity === 'medium' ? "bg-amber-500/20" : "bg-blue-500/20"
            )}>
              <AlertTriangle className={cn("h-4 w-4", 
                finding.severity === 'high' ? "text-red-400" : 
                finding.severity === 'medium' ? "text-amber-400" : "text-blue-400")} />
            </div>
            <span className="font-bold tracking-tight text-sm uppercase">{finding.category}</span>
            <div className="ml-auto">
               <Badge variant="outline" className={cn(
                  "text-[10px] px-1.5 py-0",
                  finding.severity === 'high' ? "border-red-500/50 text-red-400" :
                  finding.severity === 'medium' ? "border-amber-500/50 text-amber-400" : "border-blue-500/50 text-blue-400"
               )}>
                 {finding.severity.toUpperCase()} PRIORITY
               </Badge>
            </div>
          </div>
          <p className="text-sm leading-relaxed opacity-90">{finding.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {finding.recommendations?.map((rec: string, ri: number) => (
              <span key={ri} className="text-[10px] bg-black/30 border border-white/5 px-2 py-1 rounded text-slate-400 font-mono">
                → {rec}
              </span>
            ))}
          </div>
        </div>
      );
    } catch (e) { return null; }
  };

  return (
    <div className="space-y-4 p-6 bg-[#090C14] text-slate-200 rounded-2xl border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative min-h-[600px] flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500/80">SENSORS: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-500/80">CAUSAL ENGINE: ONLINE</span>
          </div>
          <div className="text-slate-500 tracking-wider">SECURE LINK ESTABLISHED</div>
        </div>
        <div className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700 font-mono">
          REF: ARGUS-INTEL-{order?.order_number?.split('-').pop()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 bg-slate-900/50 border border-slate-800 p-1 mb-4 h-11">
          <TabsTrigger 
            value="thinking" 
            className="flex items-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-blue-400 transition-all duration-300"
          >
            <BrainCircuit className="h-4 w-4" /> 
            <span className="font-medium">思考过程</span>
            {thinkingComplete && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in" />}
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            className="flex items-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-purple-400 transition-all duration-300"
          >
            <LineChart className="h-4 w-4" /> 
            <span className="font-medium">分析结果</span>
            {streamingComplete && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thinking" className="space-y-4 mt-0 animate-in fade-in duration-500">
          <div 
            ref={thinkingStepsRef} 
            className="space-y-2.5 max-h-[420px] overflow-y-auto p-4 bg-black/40 rounded-xl border border-slate-800/50 backdrop-blur-sm scrollbar-thin scrollbar-thumb-slate-800"
          >
            {thinkingSteps.length === 0 && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                <NetworkIcon className="h-10 w-10 opacity-20" />
                <p className="font-mono text-sm tracking-tight">WAITING FOR ANALYTIC PAYLOAD...</p>
              </div>
            )}
            
            {thinkingSteps.map((step, index) => (
              <div 
                key={step.id || index} 
                className={cn(
                  "p-3 rounded-lg border-l-4 flex gap-3 items-start animate-in fade-in slide-in-from-left-2 transition-all duration-500 hover:bg-white/5", 
                  getStepStyle(step.type)
                )}
              >
                <div className="bg-black/20 rounded p-1.5 mt-0.5 border border-white/5 shadow-inner">
                  {getStepIcon(step.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold whitespace-nowrap">
                      STEP {String(index + 1).padStart(2, '0')} · {step.type}
                    </span>
                    <span className="text-[9px] opacity-40 font-mono">
                      T+ {index * 0.8}s
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed tracking-tight">{step.content}</p>
                </div>
              </div>
            ))}
            
            {!thinkingComplete && isAnalyzing && (
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-blue-400/80 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs font-mono tracking-widest">SENSING ENVIRONMENT...</span>
              </div>
            )}
          </div>
          
          {thinkingComplete && (
            <div className="flex justify-center pt-2">
              <Button 
                onClick={() => setActiveTab("result")}
                className="bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all px-8 h-12 rounded-xl group"
              >
                查看分析结果 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="result" className="h-[520px] overflow-y-auto mt-0 pr-2 animate-in slide-in-from-right-4 duration-500 min-h-[400px]">
          {order && activeResult ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                <div className="relative z-10">
                  <h4 className="font-bold text-lg text-white group flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    订单 {order.order_number}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                      {order.customer_name || order.customer}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                      {order.product_name}
                    </span>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <div className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1 font-mono">RISK PROBABILITY</div>
                <div className={cn(
                    "text-3xl font-black font-mono",
                    activeResult && activeResult.riskScore > 0.7 ? "text-red-500" :
                    activeResult && activeResult.riskScore > 0.4 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {activeResult ? (activeResult.riskScore * 100).toFixed(0) : "0"}<span className="text-sm ml-0.5">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">主要发现 ({streamedFindings.length})</h5>
                  <div className="h-px bg-slate-800 flex-1 ml-2" />
                </div>
                
                <div className="grid gap-3">
                  {streamedFindings.map((f, i) => renderFinding(f, i))}
                </div>
                
                {streamedSummary && (
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative p-5 bg-slate-900 rounded-xl border border-slate-800/50 leading-relaxed text-sm text-slate-300 shadow-inner">
                      <Lightbulb className="h-5 w-5 text-amber-500 mb-3" />
                      {streamedSummary}
                    </div>
                  </div>
                )}
                
                {showChart && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex items-center gap-2 px-1 mt-6 mb-3">
                      <BarChart4 className="h-4 w-4 text-blue-400" />
                      <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">可视化推演</h5>
                    </div>
                    {renderChart()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="font-mono text-sm tracking-tight text-blue-400 uppercase">Awaiting Intel Payload...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-800/50">
        <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
          CAUSAL_NODES: 128 | DATAPOINTS: 1.4M | LATENCY: 24ms
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-700"
          >
            取消
          </Button>
          <Button 
            onClick={() => onExport(thinkingSteps)}
            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-xl"
          >
            <Download className="mr-2 h-4 w-4" />
            导出分析报告
          </Button>
        </div>
      </div>
    </div>
  );
}
