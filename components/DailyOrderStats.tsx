"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  BrainCircuitIcon,
  TrendingUpIcon,
  ActivityIcon,
  BoxIcon,
  CheckCircle2Icon,
  ClockIcon,
  PackageIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

// 生成 12 个月的模拟数据
const generateMonthlyStats = () => {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  
  return months.map((month, index) => {
    // 基础订单数：模拟全年的季节性波动，Q4 是高峰
    const seasonalFactor = index >= 9 ? 2.5 : index >= 6 ? 1.8 : 1.2;
    const baseOrders = Math.floor(Math.random() * 50 * seasonalFactor) + 100;
    
    // 已完成订单数：模拟一个较高的完成率
    const completed = Math.floor(baseOrders * (0.85 + Math.random() * 0.1));
    const processing = baseOrders - completed;
    
    // 效率指数：模拟与订单量相关的波动，通过 AI 优化
    const efficiency = 88 + Math.floor(Math.random() * 8) + (index > 8 ? 2 : 0);
    
    // AI 预测值：略高于当前值，模拟智能预测
    const forecast = Math.floor(baseOrders * (1.1 + Math.random() * 0.15));

    return {
      month,
      orders: baseOrders,
      completed,
      processing,
      efficiency,
      forecast,
      trend: +(10 * Math.sin(index / 12 * Math.PI)).toFixed(1), // 模拟趋势线
    };
  });
};

const data = generateMonthlyStats();

// 自定义工具提示
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const monthData = payload[0].payload;
    return (
      <div className="bg-background/90 backdrop-blur-md border-2 border-primary/20 p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
          <SparklesIcon className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-base">{label} 智能分析</h3>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="text-muted-foreground flex items-center">
              <BoxIcon className="h-3.5 w-3.5 mr-2" />
              实际订单:
            </span>
            <span className="font-bold text-foreground">{monthData.orders}</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="text-muted-foreground flex items-center">
              <CheckCircle2Icon className="h-3.5 w-3.5 mr-2" />
              交付完成:
            </span>
            <span className="font-bold text-green-500">{monthData.completed}</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="text-muted-foreground flex items-center">
              <ZapIcon className="h-3.5 w-3.5 mr-2 text-blue-400" />
              AI 预测量:
            </span>
            <span className="font-bold text-blue-400">{monthData.forecast}</span>
          </div>
          <div className="flex items-center justify-between gap-6 text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground flex items-center">
              <ActivityIcon className="h-3.5 w-3.5 mr-2" />
              效率协同:
            </span>
            <span className="font-bold text-primary">{monthData.efficiency}%</span>
          </div>
        </div>
        <div className="mt-3 bg-primary/10 p-2 rounded-md">
          <p className="text-[10px] leading-tight text-primary/80 font-medium">
            🚩 系统洞察：该月订单量偏离均值 {monthData.trend > 0 ? '+' : ''}{monthData.trend}%，建议平衡库存水位。
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function DailyOrderStats() {
  const totalOrders = data.reduce((sum, m) => sum + m.orders, 0);
  const avgEfficiency = Math.round(data.reduce((sum, m) => sum + m.efficiency, 0) / data.length);
  const growthRate = "+12.5%";

  return (
    <Card className="col-span-full border-none shadow-xl bg-gradient-to-b from-card to-card/50 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 pt-4 opacity-5">
        <BrainCircuitIcon className="h-48 w-48 text-primary" />
      </div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                月度订单统计与 AI 洞察
              </CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 animate-pulse transition-all">
                <BrainCircuitIcon className="h-3.5 w-3.5 mr-1.5" />
                智能模型 v4.2 监控中
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">实时分析生产链路中的订单流转与资源利用率</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-2 rounded-xl backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2 px-2 border-r border-border/50 pr-4">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]"></div>
              <span className="text-xs font-semibold">总订单量</span>
            </div>
            <div className="flex items-center gap-2 px-2 border-r border-border/50 pr-4">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-400"></div>
              <span className="text-xs font-semibold">AI 预测</span>
            </div>
            <div className="flex items-center gap-2 px-2">
              <div className="h-0.5 w-4 bg-green-500 rounded-full"></div>
              <span className="text-xs font-semibold">效率趋势</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="relative group p-5 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all duration-300 border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <PackageIcon className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs font-mono">ANNUAL TOTAL</Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">年度累计订单</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums tracking-tighter">{totalOrders.toLocaleString()}</span>
                <span className="text-xs font-bold text-green-500 flex items-center">
                  <TrendingUpIcon className="h-3 w-3 mr-0.5" />
                  {growthRate}
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative group p-5 rounded-2xl bg-green-500/5 hover:bg-green-500/10 transition-all duration-300 border border-green-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <ActivityIcon className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs font-mono text-green-600 border-green-200">OPTIMIZED</Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">平均作业效率</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-green-600 tabular-nums tracking-tighter">{avgEfficiency}%</span>
                <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 bg-green-50 rounded-full">稳定运行</span>
              </div>
            </div>
          </div>
          
          <div className="relative group p-5 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-300 border border-blue-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs font-mono text-blue-600 border-blue-200">REAL-TIME</Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">平均结单时长</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600 tabular-nums tracking-tighter">4.8h</span>
                <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 bg-blue-50 rounded-full">下降 0.5h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full p-2 bg-muted/10 rounded-3xl border border-border/30 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                fill="url(#areaGradient)" 
                stroke="#60a5fa" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Bar 
                dataKey="orders" 
                barSize={32} 
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                yAxisId={0} // 示意用途，可根据需要设置双 Y 轴
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">AI 业务智能看板</p>
              <p className="text-xs text-muted-foreground">根据历史趋势，预计下个季度订单量将环比增长 18.4%</p>
            </div>
          </div>
          <button className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all transform hover:-translate-y-0.5">
            查看深度分析报告
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
 