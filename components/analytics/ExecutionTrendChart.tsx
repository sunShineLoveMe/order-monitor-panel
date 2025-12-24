"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface Props {
  data: { hour: string; count: number }[];
}

export default function ExecutionTrendChart({ data }: Props) {
  // 确保 24 小时都有数据
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0") + ":00";
    const existing = data.find((d) => d.hour === hour);
    return {
      hour,
      count: existing?.count || 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-cyan-400 font-medium">{label}</p>
          <p className="text-white">
            <span className="text-slate-400">执行次数: </span>
            <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">24小时执行趋势</h3>
          <p className="text-slate-400 text-sm">工作流执行频率分布</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={fullData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
