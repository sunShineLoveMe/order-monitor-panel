"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIService, AIInsight, aiService } from "@/lib/services/ai";
import { RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatabaseService } from "@/lib/services/database";

interface AIInsightCardProps {
  className?: string;
}

export default function AIInsightCard({ className }: AIInsightCardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      
      // 获取最近30天的订单和库存数据
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const orders = await DatabaseService.getOrders();
      const inventory = await DatabaseService.getInventory();
      
      const data = {
        orders,
        inventory,
        timeRange: {
          start: startDate,
          end: endDate
        }
      };
      
      const result = await aiService.generateInsights(data);
      setInsights(result);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("加载AI洞察失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'sales':
        return 'default';
      case 'inventory':
        return 'secondary';
      case 'supply_chain':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>AI 洞察</CardTitle>
          <CardDescription>
            {lastUpdated ? `最后更新: ${lastUpdated}` : '加载中...'}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadInsights}
          disabled={isLoading}
        >
          <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant={getBadgeVariant(insight.type)}>
                  {insight.type === 'sales' ? '销售' :
                   insight.type === 'inventory' ? '库存' : '供应链'}
                </Badge>
                <h4 className="font-semibold">{insight.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          ))}
          {insights.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">暂无洞察</p>
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground">正在分析数据...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 