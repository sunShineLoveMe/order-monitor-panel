"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface Props {
  data: { hour: string; count: number }[];
}

export default function ExecutionTrendChart({ data }: Props) {
  // 补全所有小时数据（如果没有）
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const hour = `${i.toString().padStart(2, "0")}:00`;
    const existing = data.find((d) => d.hour === hour);
    return existing || { hour, count: 0 };
  });

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-cyan-500/30">
      {/* 科技边框装饰 */}
      <div className="tech-corner-tl opacity-30 group-hover:opacity-100 transition-opacity" />
      <div className="tech-corner-br opacity-30 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-white tracking-tight uppercase">24小时执行趋势</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Temporal Density Analysis</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-lg">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-tighter">Live Feed</span>
        </div>
      </div>

      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fullData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="#475569"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                fontFamily: 'monospace'
              }}
              itemStyle={{ color: "#06b6d4", fontWeight: "bold" }}
              cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 装饰性背景 */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
}
