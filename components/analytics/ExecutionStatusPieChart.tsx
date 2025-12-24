"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface Props {
  data: { status: string; count: number; color: string }[];
}

export default function ExecutionStatusPieChart({ data }: Props) {
  const labels: Record<string, string> = {
    success: "SUCCESS",
    error: "ERROR",
    running: "RUNNING",
    waiting: "WAITING",
  };

  const formattedData = data.map(item => ({
    ...item,
    name: labels[item.status] || item.status.toUpperCase()
  }));

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-cyan-500/30">
      {/* 科技边框装饰 */}
      <div className="tech-corner-tl opacity-30 group-hover:opacity-100 transition-opacity" />
      <div className="tech-corner-br opacity-30 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-500/5">
            <PieIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-white tracking-tight uppercase">执行状态分布</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">System Distribution Metrics</p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="40%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={8}
              dataKey="count"
              animationBegin={200}
              animationDuration={1500}
              stroke="none"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="hover:opacity-80 transition-opacity cursor-pointer filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                />
              ))}
            </Pie>
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
              itemStyle={{ fontWeight: "bold" }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry: any) => (
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-2 flex items-center justify-between min-w-[120px]">
                  {value}
                  <span className="text-white font-mono ml-4">
                    {entry.payload.count}
                  </span>
                </span>
              )}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 装饰性背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
}
