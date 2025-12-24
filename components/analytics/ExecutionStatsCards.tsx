"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { AnalyticsSummary } from "@/lib/types";

interface Props {
  summary: AnalyticsSummary;
}

export default function ExecutionStatsCards({ summary }: Props) {
  const stats = [
    {
      label: "总执行次数",
      value: summary.totalExecutions,
      subValue: `+12.5%`,
      icon: Activity,
      color: "cyan",
      delay: "delay-0",
    },
    {
      label: "成功率",
      value: `${summary.successRate}%`,
      subValue: `${summary.successCount} 成功`,
      icon: CheckCircle2,
      color: "emerald",
      delay: "delay-100",
    },
    {
      label: "平均耗时",
      value: `${(summary.avgExecutionTime / 1000).toFixed(1)}s`,
      subValue: "每次执行",
      icon: Clock,
      color: "amber",
      delay: "delay-200",
    },
    {
      label: "峰值时段",
      value: `${summary.peakHour}:00`,
      subValue: "14 次执行",
      icon: Zap,
      color: "purple",
      delay: "delay-300",
    },
  ];

  const getColorStyles = (color: string) => {
    const styles: Record<string, string> = {
      cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };
    return styles[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorStyle = getColorStyles(stat.color);
        
        return (
          <div
            key={stat.label}
            className={`group relative p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-500 hover:border-cyan-500/40 hover:translate-y-[-4px] argus-glow-pulse ${stat.delay}`}
          >
            {/* 科技边框修饰 */}
            <div className="tech-corner-tl opacity-30 group-hover:opacity-100 transition-opacity" />
            <div className="tech-corner-br opacity-30 group-hover:opacity-100 transition-opacity" />
            
            {/* 内部扫描光效 */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black font-mono text-white digit-pulse">
                    {stat.value}
                  </h3>
                </div>
                <div className="pt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorStyle}`}>
                    {stat.subValue}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${colorStyle} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>

            {/* 底部装饰线 */}
            <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </div>
        );
      })}
    </div>
  );
}
