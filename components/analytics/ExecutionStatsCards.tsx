"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { AnalyticsSummary } from "@/lib/types";

interface Props {
  summary: AnalyticsSummary;
}

export default function ExecutionStatsCards({ summary }: Props) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // 找到峰值时段
  const peakHour = summary.executionsByHour.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    { hour: "N/A", count: 0 }
  );

  const cards = [
    {
      title: "总执行次数",
      value: summary.totalExecutions.toLocaleString(),
      icon: Activity,
      gradient: "from-cyan-500 to-blue-500",
      bgGlow: "bg-cyan-500/20",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "成功率",
      value: `${summary.successRate}%`,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/20",
      subValue: `${summary.successCount} 成功`,
    },
    {
      title: "平均耗时",
      value: formatTime(summary.avgExecutionTime),
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/20",
      subValue: "每次执行",
    },
    {
      title: "峰值时段",
      value: peakHour.hour,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      bgGlow: "bg-purple-500/20",
      subValue: `${peakHour.count} 次执行`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="relative group overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* 发光背景 */}
          <div
            className={`absolute inset-0 ${card.bgGlow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />

          {/* 卡片内容 */}
          <div className="relative p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl hover:border-slate-600/80 transition-all duration-300">
            {/* 顶部图标和标题 */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} bg-opacity-20`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* 主要数值 */}
            <div className="mb-2">
              <span
                className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
              >
                {card.value}
              </span>
            </div>

            {/* 底部信息 */}
            <div className="flex items-center gap-2">
              {card.trend && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    card.trendUp
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {card.trend}
                </span>
              )}
              {card.subValue && (
                <span className="text-slate-500 text-sm">{card.subValue}</span>
              )}
            </div>

            {/* 装饰线 */}
            <div
              className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${card.gradient} w-full opacity-50`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
