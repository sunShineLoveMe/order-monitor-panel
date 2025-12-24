"use client";

import React, { useState } from "react";
import {
  Link2,
  ChevronRight,
  Package,
  Workflow,
  Activity,
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
    });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Link2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">订单-工作流关联</h3>
            <p className="text-slate-400 text-sm">
              展示订单与工作流执行的对应关系
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {topOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            暂无订单关联数据
          </div>
        ) : (
          topOrders.map((order) => {
            const orderExecutions = getOrderExecutions(order.orderId);
            const isExpanded = expandedOrder === order.orderId;
            const successCount = orderExecutions.filter(
              (e) => e.status === "success"
            ).length;
            const errorCount = orderExecutions.filter(
              (e) => e.status === "error"
            ).length;

            return (
              <div key={order.orderId}>
                {/* 订单行 */}
                <button
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order.orderId)
                  }
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Package className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-medium">
                          {order.orderId}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                          {order.executionCount} 次执行
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-emerald-400">
                          ✓ {successCount} 成功
                        </span>
                        {errorCount > 0 && (
                          <span className="text-red-400">
                            ✗ {errorCount} 失败
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* 展开详情 */}
                {isExpanded && orderExecutions.length > 0 && (
                  <div className="bg-slate-800/30 border-t border-slate-700/30">
                    <div className="p-4 space-y-3">
                      {orderExecutions.map((exec, index) => (
                        <div
                          key={exec.id}
                          className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
                        >
                          {/* 连接线指示 */}
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                              <Workflow className="w-4 h-4 text-slate-400" />
                            </div>
                            {index !== orderExecutions.length - 1 && (
                              <div className="absolute top-8 left-1/2 w-px h-6 bg-slate-600/50 -translate-x-1/2" />
                            )}
                          </div>

                          {/* 执行信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-medium truncate">
                                {exec.workflowName}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  exec.status === "success"
                                    ? "bg-emerald-400"
                                    : exec.status === "error"
                                    ? "bg-red-400"
                                    : "bg-amber-400"
                                }`}
                              />
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(exec.executionTime)}
                              </span>
                              <span>{formatDate(exec.startedAt)}</span>
                              <span className="capitalize">{exec.triggerType}</span>
                            </div>
                          </div>

                          {/* 执行 ID */}
                          <div className="text-right">
                            <span className="font-mono text-xs text-slate-500">
                              #{exec.id.slice(-8)}
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
