"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Target } from "lucide-react";

interface Props {
  data: { status: string; count: number; color: string }[];
}

export default function ExecutionStatusPieChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-white font-medium">{item.status}</span>
          </div>
          <p className="text-slate-300 mt-1">
            {item.count} 次 ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Target className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">执行状态分布</h3>
          <p className="text-slate-400 text-sm">工作流执行结果统计</p>
        </div>
      </div>

      <div className="flex items-center">
        {/* 饼图 */}
        <div className="h-56 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.filter(d => d.count > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {data.filter(d => d.count > 0).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 图例 */}
        <div className="flex flex-col gap-3 ml-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 text-sm min-w-[60px]">
                {item.status}
              </span>
              <span className="text-white font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 中心数字 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none hidden">
        <div className="text-2xl font-bold text-white">{total}</div>
        <div className="text-slate-400 text-xs">总计</div>
      </div>
    </div>
  );
}
