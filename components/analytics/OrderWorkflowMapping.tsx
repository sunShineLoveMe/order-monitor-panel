"use client";

import React, { useState } from "react";
import {
  Link2,
  ChevronRight,
  Package,
  Workflow,
  Clock,
} from "lucide-react";
import { N8nExecution } from "@/lib/types";

interface Props {
  topOrders: { orderId: string; executionCount: number }[];
  executions: N8nExecution[];
}

export default function OrderWorkflowMapping({ topOrders, executions }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getOrderExecutions = (orderId: string) => {
    return executions.filter((exec) => exec.orderId === orderId);
  };

  const formatTime = (ms: number | undefined) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Link2 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight uppercase">订单与工作流关联</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Mapping System: Corelation Analysis Engine v1.0
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/30">
        {topOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-600 tracking-[0.3em] font-black text-[10px] uppercase">
            No Correlation Data Available
          </div>
        ) : (
          topOrders.map((order, idx) => {
            const orderExecutions = getOrderExecutions(order.orderId);
            const isExpanded = expandedOrder === order.orderId;
            const successCount = orderExecutions.filter(
              (e) => e.status === "success"
            ).length;
            const errorCount = orderExecutions.filter(
              (e) => e.status === "error"
            ).length;

            return (
              <div 
                key={order.orderId}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* 订单行 */}
                <button
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order.orderId)
                  }
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-cyan-500/5 transition-all duration-300 group relative"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                  
                  <div className="flex items-center gap-5">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 group-hover:border-cyan-500/30 transition-colors shadow-inner">
                      <Package className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-500 font-black tracking-wider text-base">
                          {order.orderId}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700 uppercase tracking-widest">
                          {order.executionCount} Executions
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">
                            {successCount} Success
                          </span>
                        </div>
                        {errorCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            <span className="text-[10px] font-black text-red-500/80 uppercase tracking-widest">
                              {errorCount} Failed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-full bg-slate-800/50 border border-slate-700 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300 ${isExpanded ? "rotate-90 bg-cyan-500/10 border-cyan-500/30" : ""}`}>
                    <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors`} />
                  </div>
                </button>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="bg-slate-950/40 border-t border-slate-800/50 overflow-hidden animate-slide-up">
                    <div className="p-6 space-y-4">
                      {orderExecutions.map((exec, index) => (
                        <div
                          key={exec.id}
                          className="flex items-center gap-5 p-4 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-cyan-500/20 transition-all group/item"
                        >
                          {/* 连接线指示 */}
                          <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full bg-slate-800 border-2 flex items-center justify-center transition-all duration-500 shadow-xl ${
                              exec.status === "success" 
                                ? "group-hover/item:border-emerald-500/50 group-hover/item:shadow-emerald-500/5" 
                                : "group-hover/item:border-red-500/50 group-hover/item:shadow-red-500/5"
                            }`}>
                              <Workflow className="w-5 h-5 text-slate-500 group-hover/item:text-cyan-400" />
                            </div>
                            {index !== orderExecutions.length - 1 && (
                              <div className="absolute top-10 w-[2px] h-4 bg-gradient-to-b from-slate-800 to-transparent" />
                            )}
                          </div>

                          {/* 执行信息 */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-white text-sm font-black tracking-tight group-hover/item:text-cyan-400 transition-colors">
                                {exec.workflowName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${
                                    exec.status === "success"
                                      ? "bg-emerald-400 shadow-emerald-400/50"
                                      : exec.status === "error"
                                      ? "bg-red-400 shadow-red-400/50"
                                      : "bg-cyan-400 shadow-cyan-400/50"
                                  }`}
                                />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                  {exec.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Clock className="w-3 h-3" />
                                {formatTime(exec.executionTime)}
                              </span>
                              <span className="font-mono">{formatDate(exec.startedAt)}</span>
                              <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 border border-slate-700">{exec.triggerType}</span>
                            </div>
                          </div>

                          {/* 执行 ID */}
                          <div className="text-right">
                            <span className="font-mono text-[10px] text-slate-600 font-black group-hover/item:text-slate-400 transition-colors">
                              #{exec.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
