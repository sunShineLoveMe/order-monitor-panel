"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BrainCircuitIcon,
  TrendingUpIcon,
  ActivityIcon,
  BoxIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  PackageIcon,
} from "lucide-react";

// 生成最近10天的日期数组
const generateRecentDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 9; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    dates.push(`${month}月${day}日`);
  }
  
  return dates;
};

// 模拟数据
const data = generateRecentDates().map(date => {
  // 基础订单数在2-5之间波动
  const baseOrders = Math.floor(Math.random() * 4) + 2;
  // 已完成订单数略少于总订单数
  const completed = Math.max(1, baseOrders - Math.floor(Math.random() * 2));
  // 处理中的订单为总数减去完成的
  const processing = baseOrders - completed;
  // 效率指数在85-98之间波动
  const efficiency = Math.floor(Math.random() * 14) + 85;
  // 处理时间在1.5-4小时之间波动
  const processHours = (1.5 + Math.random() * 2.5).toFixed(1);
  
  return {
    date,
    orders: baseOrders,
    completed,
    processing,
    efficiency,
    avgProcessTime: `${processHours}h`,
    anomaly: Math.random() > 0.9 ? 1 : 0, // 10%的概率出现异常
  };
});

// 自定义工具提示
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const orderData = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border p-3 rounded-lg shadow-lg">
        <h3 className="font-medium text-sm mb-2">{label}</h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground flex items-center">
              <BoxIcon className="h-3 w-3 mr-1" />
              总订单:
            </span>
            <span className="font-medium">{orderData.orders}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground flex items-center">
              <CheckCircle2Icon className="h-3 w-3 mr-1" />
              已完成:
            </span>
            <span className="font-medium text-green-500">{orderData.completed}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              处理中:
            </span>
            <span className="font-medium text-blue-500">{orderData.processing}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs border-t border-border/50 mt-2 pt-2">
            <span className="text-muted-foreground flex items-center">
              <ActivityIcon className="h-3 w-3 mr-1" />
              效率指数:
            </span>
            <span className={`font-medium ${
              orderData.efficiency >= 95 ? 'text-green-500' :
              orderData.efficiency >= 90 ? 'text-blue-500' : 'text-yellow-500'
            }`}>
              {orderData.efficiency}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DailyOrderStats() {
  // 计算统计数据
  const totalOrders = data.reduce((sum, day) => sum + day.orders, 0);
  const avgEfficiency = Math.round(
    data.reduce((sum, day) => sum + day.efficiency, 0) / data.length
  );
  const latestProcessTime = data[data.length - 1].avgProcessTime;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">每日订单统计</CardTitle>
            <Badge variant="outline" className="text-xs">
              <BrainCircuitIcon className="h-3 w-3 mr-1" />
              AI监控中
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">已完成</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">处理中</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="space-y-2 p-4 rounded-lg bg-primary/5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">总订单量</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{totalOrders}</span>
              <Badge variant="outline" className="text-xs">
                本周期
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 p-4 rounded-lg bg-green-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium">平均效率</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-500">{avgEfficiency}%</span>
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
            </div>
          </div>
          
          <div className="space-y-2 p-4 rounded-lg bg-blue-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium">平均处理时间</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-500">{latestProcessTime}</span>
              <Badge variant="outline" className="text-xs">
                实时
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar
                dataKey="orders"
                fill="url(#orderGradient)"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 