"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { dashboardService, type DashboardStats, type DashboardUpdate } from "@/lib/services/dashboard";
import { useEffect, useState } from "react";

interface ChartData {
  name: string;
  inbound: number;
  outbound: number;
}

interface MonthlyStats {
  month: string;
  inbound: number;
  outbound: number;
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([]);

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
    return (stats.monthlyStats as MonthlyStats[]).map(stat => ({
      name: stat.month,
      inbound: stat.inbound,
      outbound: stat.outbound
    }));
  };

  return (
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
        />
        <Bar
          dataKey="inbound"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          name="入库"
        />
        <Bar
          dataKey="outbound"
          fill="hsl(var(--secondary))"
          radius={[4, 4, 0, 0]}
          name="出库"
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 