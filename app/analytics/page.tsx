"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
  Eye,
  Brain,
} from "lucide-react";
import { N8nExecution, AnalyticsSummary } from "@/lib/types";
import ExecutionStatsCards from "@/components/analytics/ExecutionStatsCards";
import ExecutionTrendChart from "@/components/analytics/ExecutionTrendChart";
import ExecutionStatusPieChart from "@/components/analytics/ExecutionStatusPieChart";
import ExecutionHistoryTable from "@/components/analytics/ExecutionHistoryTable";
import OrderWorkflowMapping from "@/components/analytics/OrderWorkflowMapping";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [executions, setExecutions] = useState<N8nExecution[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchExecutions = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/n8n/executions?limit=100");
      const data = await response.json();

      if (data.success) {
        setExecutions(data.executions);
        setSummary(data.summary);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.message || "获取执行历史失败");
      }
    } catch (err: any) {
      setError(err.message || "网络请求失败");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    // 每 30 秒自动刷新
    const interval = setInterval(fetchExecutions, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] p-6 lg:p-8 overflow-hidden">
      {/* 极智背景：动态网格层 */}
      <div className="absolute inset-0 argus-grid-bg opacity-20 pointer-events-none" />
      
      {/* 全局扫描线 */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-[scanline_10s_linear_infinite] opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-cyan-500/20 blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative p-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent w-full h-full animate-[scanline_5s_linear_infinite] pointer-events-none" />
                  <Brain className="w-10 h-10 text-cyan-400 relative z-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    智能洞察中心
                  </h1>
                  <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">Live Monitoring</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm font-medium flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Argus Eye Workflow Intelligence System v1.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {lastUpdated && (
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-inner">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">
                    {lastUpdated.toLocaleTimeString("zh-CN", { hour12: false })}
                  </span>
                </div>
              )}
              <button
                onClick={fetchExecutions}
                disabled={isRefreshing}
                className="relative group overflow-hidden px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 transition-all duration-500 shadow-lg shadow-cyan-500/5"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <div className="flex items-center gap-2.5 relative z-10">
                  <RefreshCw
                    className={`w-4 h-4 transition-transform ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 duration-500"}`}
                  />
                  <span className="text-xs font-black tracking-[0.15em] uppercase">Update Data</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-slide-up backdrop-blur-sm shadow-2xl shadow-red-500/5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-red-400 font-bold text-sm uppercase tracking-wider">System Error</p>
                <span className="text-red-300/80 text-sm">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* 主内容区 */}
        {loading ? (
          <div className="flex items-center justify-center h-[50vh] animate-fade-in">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-cyan-500/10 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-t-2 border-cyan-500 rounded-full animate-spin" />
                <div className="absolute inset-2 w-16 h-16 border-b-2 border-purple-500/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-cyan-400 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Syncing Environment</p>
                <p className="text-slate-500 text-sm">Initializing n8n Secure Data Protocol...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* 统计卡片 */}
            {summary && <ExecutionStatsCards summary={summary} />}

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {summary && (
                <>
                  <div className="animate-slide-up delay-100">
                    <ExecutionTrendChart data={summary.executionsByHour} />
                  </div>
                  <div className="animate-slide-up delay-200">
                    <ExecutionStatusPieChart data={summary.executionsByStatus} />
                  </div>
                </>
              )}
            </div>

            {/* 订单-工作流关联 */}
            {summary && summary.topOrders.length > 0 && (
              <div className="animate-slide-up delay-300">
                <OrderWorkflowMapping topOrders={summary.topOrders} executions={executions} />
              </div>
            )}

            {/* 执行历史表格 */}
            <div className="animate-slide-up delay-[400ms]">
              <ExecutionHistoryTable executions={executions} />
            </div>
          </div>
        )}
      </div>

      {/* 装饰性背景元素 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
