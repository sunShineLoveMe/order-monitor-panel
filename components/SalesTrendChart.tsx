"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3Icon, 
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  ArrowRightIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DatabaseService } from "@/lib/services/database";
import { supabase } from "@/lib/supabase";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesPrediction {
  date: string;
  revenue: number;
  quantity: number;
  growthRate: number;
  upperBound: number;
  lowerBound: number;
}

interface SalesTrendChartProps {
  className?: string;
}

export function SalesTrendChart({ className }: SalesTrendChartProps) {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("short");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Array<{id: string, name: string}>>([
    { id: "1", name: "iPhone 15" },
    { id: "2", name: "MacBook Air" },
    { id: "3", name: "iPad Pro" },
    { id: "4", name: "AirPods Pro" }
  ]);

  const loadSalesPredictions = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getSalesPredictions({
        timeframe,
        productId: selectedProduct,
      });
      setPredictions(data);
    } catch (error) {
      console.error("Error loading sales predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesPredictions();

    // 订阅实时更新
    const channel = supabase
      .channel("sales-predictions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales_predictions" },
        () => {
          loadSalesPredictions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [timeframe, selectedProduct]);

  const handleRefresh = () => {
    loadSalesPredictions();
  };

  // 获取趋势图标
  const getTrendIcon = (direction: "up" | "down" | "stable") => {
    if (direction === "up") return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (direction === "down") return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <RefreshCwIcon className="h-4 w-4 text-yellow-500" />;
  };

  // 格式化收入数据（转为万元）
  const formatRevenue = (value: number) => {
    return `¥${(value / 10000).toFixed(2)}万`;
  };

  // 获取时间范围文本
  const getTimeframeText = () => {
    switch (timeframe) {
      case "short": return "未来3个月";
      case "medium": return "未来6个月";
      case "long": return "未来12个月";
      default: return "";
    }
  };

  const getAverageGrowthRate = () => {
    if (predictions.length === 0) return 0;
    const totalGrowth = predictions.reduce((sum, p) => sum + p.growthRate, 0);
    return totalGrowth / predictions.length;
  };

  const getTotalQuantity = () => {
    return predictions.reduce((sum, p) => sum + p.quantity, 0);
  };

  const getTotalRevenue = () => {
    return predictions.reduce((sum, p) => sum + p.revenue, 0);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>销售趋势预测</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>销售趋势预测</CardTitle>
        <Tabs value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
          <TabsList>
            <TabsTrigger value="short">短期 (3个月)</TabsTrigger>
            <TabsTrigger value="medium">中期 (6个月)</TabsTrigger>
            <TabsTrigger value="long">长期 (12个月)</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">平均增长率</div>
              <div className="text-2xl font-bold">
                {getAverageGrowthRate().toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">总销量</div>
              <div className="text-2xl font-bold">{getTotalQuantity()}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">总收入</div>
              <div className="text-2xl font-bold">
                {formatRevenue(getTotalRevenue())}
              </div>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={predictions}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bounds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatRevenue} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                formatter={(value: any) =>
                  typeof value === "number" ? formatRevenue(value) : value
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#revenue)"
              />
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="#82ca9d"
                fillOpacity={0.3}
                fill="url(#bounds)"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="#82ca9d"
                fillOpacity={0.3}
                fill="url(#bounds)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 