"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line
} from "recharts";
import { aiService, type SalesPrediction } from "@/lib/services/ai";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SalesForecastChartProps {
  productId: string;
  timeframe: "short" | "medium" | "long";
  isLoading: boolean;
}

export function SalesForecastChart({ productId, timeframe, isLoading }: SalesForecastChartProps) {
  const [data, setData] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [productId, timeframe]);

  const loadForecast = async () => {
    if (isLoading) return;
    
    setLoading(true);
    try {
      const predictions = await aiService.forecastSales(productId, timeframe);
      setData(predictions);
    } catch (error) {
      console.error("加载销售预测失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || data.length === 0) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>加载中...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">正在生成销售预测...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 准备图表数据
  const chartData = data.map(pred => ({
    date: new Date(pred.date).toLocaleDateString(),
    revenue: Math.round(pred.revenue / 10000) / 100, // 转换为万元并保留两位小数
    quantity: pred.quantity,
    upperBound: Math.round(pred.upperBound / 10000) / 100,
    lowerBound: Math.round(pred.lowerBound / 10000) / 100
  }));

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>销售预测: {data[0].productName}</CardTitle>
          <CardDescription>
            {timeframe === "short" ? "短期 (3个月)" : 
             timeframe === "medium" ? "中期 (4个季度)" : "长期 (2年)"}
            预测，置信度: {Math.round(data[0].overallConfidence * 100)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#revenue)"
                />
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-4">
            {data[0].trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trend.trend)}
                  <span className="font-medium">{trend.period}</span>
                </div>
                <Badge variant={trend.trend === 'up' ? 'default' : 'destructive'}>
                  {trend.trend === 'up' ? '+' : ''}{Math.round(trend.change * 100)}%
                </Badge>
                <span className="text-sm text-muted-foreground">{trend.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 