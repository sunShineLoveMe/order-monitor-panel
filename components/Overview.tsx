"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { dashboardService, type DashboardStats, type DashboardUpdate } from "@/lib/services/dashboard";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ChartData {
  name: string;
  inbound: number;
  outbound: number;
  inventory: number;
  sales: number;
  profit: number;
}

interface MonthlyStats {
  month: string;
  inbound: number;
  outbound: number;
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([]);
  const [visibleFields, setVisibleFields] = useState<{
    inbound: boolean;
    outbound: boolean;
    inventory: boolean;
    sales: boolean;
    profit: boolean;
  }>({
    inbound: true,
    outbound: true,
    inventory: true,
    sales: false,
    profit: false
  });

  // 切换数据显示
  const toggleField = (field: keyof typeof visibleFields) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      const stats = await dashboardService.getStats();
      const chartData = transformStatsToChartData(stats);
      setData(chartData);
    };

    loadData();

    const unsubscribe = dashboardService.subscribe((update: DashboardUpdate) => {
      if (update.type === "stats") {
        const chartData = transformStatsToChartData(update.data);
        setData(chartData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const transformStatsToChartData = (stats: DashboardStats): ChartData[] => {
    // 生成模拟的销售和利润数据
    return (stats.monthlyStats as MonthlyStats[]).map(stat => {
      // 调整数据比例，让图表更美观
      const inbound = stat.inbound;
      const outbound = stat.outbound;
      // 计算库存量，保持在一个合理的范围
      const inventory = Math.max(10, inbound - outbound + Math.round(Math.random() * 20));
      
      // 模拟销售额，约为出库数的10倍
      const sales = Math.round(outbound * 10 + Math.random() * outbound * 2);
      
      // 利润约为销售额的30%
      const profit = Math.round(sales * 0.3);
      
      return {
        name: stat.month,
        inbound,
        outbound,
        inventory,
        // 缩小比例以适应图表
        sales: Math.round(sales / 10), // 显示时将销售额缩小10倍
        profit: Math.round(profit / 3) // 显示时将利润缩小3倍
      };
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={visibleFields.inbound ? "default" : "outline"} 
          size="sm" 
          onClick={() => toggleField("inbound")}
          className={`text-xs h-7 px-3 transition-all ${visibleFields.inbound ? 'shadow-[0_0_10px_rgba(14,165,233,0.3)] border-blue-500/50' : ''}`}
        >
          入库
        </Button>
        <Button 
          variant={visibleFields.outbound ? "default" : "outline"} 
          size="sm" 
          onClick={() => toggleField("outbound")}
          className={`text-xs h-7 px-3 transition-all ${visibleFields.outbound ? 'shadow-[0_0_10px_rgba(99,102,241,0.3)] border-indigo-500/50' : ''}`}
        >
          出库
        </Button>
        <Button 
          variant={visibleFields.inventory ? "default" : "outline"} 
          size="sm" 
          onClick={() => toggleField("inventory")}
          className={`text-xs h-7 px-3 transition-all ${visibleFields.inventory ? 'shadow-[0_0_10px_rgba(16,185,129,0.3)] border-emerald-500/50' : ''}`}
        >
          库存
        </Button>
        <Button 
          variant={visibleFields.sales ? "default" : "outline"} 
          size="sm" 
          onClick={() => toggleField("sales")}
          className={`text-xs h-7 px-3 transition-all ${visibleFields.sales ? 'shadow-[0_0_10px_rgba(245,158,11,0.3)] border-amber-500/50' : ''}`}
        >
          销售额 (×10)
        </Button>
        <Button 
          variant={visibleFields.profit ? "default" : "outline"} 
          size="sm" 
          onClick={() => toggleField("profit")}
          className={`text-xs h-7 px-3 transition-all ${visibleFields.profit ? 'shadow-[0_0_10px_rgba(236,72,153,0.3)] border-pink-500/50' : ''}`}
        >
          利润 (×3)
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px"
            }}
            labelStyle={{
              color: "hsl(var(--foreground))"
            }}
            formatter={(value: number, name: string) => {
              // 销售额和利润需要转回实际值
              if (name === "销售额") return [`¥${value * 10}`, name];
              if (name === "利润") return [`¥${value * 3}`, name];
              return [value, name];
            }}
          />
          <Legend />
          {visibleFields.inbound && (
            <Bar
              dataKey="inbound"
              fill="url(#colorInbound)"
              radius={[4, 4, 0, 0]}
              name="入库"
            />
          )}
          {visibleFields.outbound && (
            <Bar
              dataKey="outbound"
              fill="url(#colorOutbound)"
              radius={[4, 4, 0, 0]}
              name="出库"
            />
          )}
          {visibleFields.inventory && (
            <Bar
              dataKey="inventory"
              fill="url(#colorInventory)"
              radius={[4, 4, 0, 0]}
              name="库存"
            />
          )}
          {visibleFields.sales && (
            <Bar
              dataKey="sales"
              fill="url(#colorSales)"
              radius={[4, 4, 0, 0]}
              name="销售额"
            />
          )}
          {visibleFields.profit && (
            <Bar
              dataKey="profit"
              fill="url(#colorProfit)"
              radius={[4, 4, 0, 0]}
              name="利润"
            />
          )}
          <defs>
            <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorInventory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
 