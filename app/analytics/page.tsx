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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
              <div className="relative p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                智能洞察中心
              </h1>
              <p className="text-slate-400 mt-1">
                工作流执行监控 · 订单追踪 · 实时分析
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-sm text-slate-500">
                更新于 {lastUpdated.toLocaleTimeString("zh-CN")}
              </span>
            )}
            <button
              onClick={fetchExecutions}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 transition-all duration-300"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              刷新数据
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
            </div>
            <span className="text-slate-400">正在连接 n8n 工作流引擎...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          {summary && <ExecutionStatsCards summary={summary} />}

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {summary && (
              <>
                <ExecutionTrendChart data={summary.executionsByHour} />
                <ExecutionStatusPieChart data={summary.executionsByStatus} />
              </>
            )}
          </div>

          {/* 订单-工作流关联 */}
          {summary && summary.topOrders.length > 0 && (
            <div className="mb-6">
              <OrderWorkflowMapping topOrders={summary.topOrders} executions={executions} />
            </div>
          )}

          {/* 执行历史表格 */}
          <ExecutionHistoryTable executions={executions} />
        </>
      )}

      {/* 装饰性背景元素 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
