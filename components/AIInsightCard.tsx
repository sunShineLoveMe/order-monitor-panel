"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIService, AIInsight, aiService } from "@/lib/services/ai";
import { RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatabaseService } from "@/lib/services/database";
import { mockAIInsights } from "@/lib/data";

interface AIInsightCardProps {
  className?: string;
}

export default function AIInsightCard({ className }: AIInsightCardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // 获取最近30天的订单和库存数据
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        // 尝试从数据库获取数据
        const ordersResult = await DatabaseService.getOrders();
        const inventory = await DatabaseService.getInventory();
        
        // 如果成功获取了数据，使用AI服务生成洞察
        if (ordersResult && ordersResult.orders && inventory) {
          const data = {
            orders: ordersResult.orders,
            inventory,
            timeRange: {
              start: startDate,
              end: endDate
            }
          };
          
          // 请求AI生成洞察
          const result = await aiService.generateInsights(data);
          
          if (result && result.length > 0) {
            setInsights(result);
            setLastUpdated(new Date().toLocaleString());
            return;
          }
        }
        
        // 如果数据获取失败或数据为空，使用模拟数据
        throw new Error("实时数据获取失败或为空");
        
      } catch (err) {
        console.warn("尝试获取实时数据失败，使用模拟数据:", err);
        
        // 将mockAIInsights转换为AI服务的AIInsight格式
        const mockInsights: AIInsight[] = mockAIInsights.map(insight => ({
          type: insight.category as 'sales' | 'inventory' | 'supply_chain',
          title: insight.title,
          description: insight.summary,
          recommendations: [insight.details]
        }));
        
        setInsights(mockInsights);
        setLastUpdated(new Date().toLocaleString() + " (模拟数据)");
      }
    } catch (error) {
      console.error("加载AI洞察失败:", error);
      setError("加载AI洞察失败，请稍后重试");
      
      // 在完全失败的情况下，仍显示一些模拟数据
      if (insights.length === 0) {
        const fallbackInsights: AIInsight[] = [
          {
            type: 'inventory',
            title: '库存优化建议',
            description: '部分商品库存偏低，建议及时补充',
            recommendations: ['检查热销商品的库存水平', '考虑增加安全库存']
          },
          {
            type: 'sales',
            title: '销售趋势分析',
            description: '近期销售额有上升趋势',
            recommendations: ['关注高增长产品线', '调整营销策略以持续增长']
          }
        ];
        setInsights(fallbackInsights);
        setLastUpdated(new Date().toLocaleString() + " (备用数据)");
      }
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
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
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
          {insights.length === 0 && !isLoading && !error && (
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