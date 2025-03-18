"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BrainCircuitIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  MinusIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  ShieldIcon,
  PackageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService, SalesPrediction, SupplyChainRisk } from "@/lib/services/ai";
import { DatabaseService } from "@/lib/services/database";
import { supabase } from "@/lib/supabase";

interface AIPredictionCardProps {
  className?: string;
}

export default function AIPredictionCard({ className }: AIPredictionCardProps) {
  const [predictions, setPredictions] = useState<{
    sales: SalesPrediction | null;
    supplyChain: SupplyChainRisk | null;
  }>({
    sales: null,
    supplyChain: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    loadPredictions();

    // 订阅实时更新
    const channel = supabase
      .channel("predictions-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "predictions" },
        () => {
          loadPredictions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadPredictions();
  };

  const loadPredictions = async () => {
    try {
      setIsLoading(true);
      
      // 获取供应链风险预测
      const supplyChainRisk = await aiService.predictSupplyChainRisks();
      
      setPredictions({
        sales: null,
        supplyChain: supplyChainRisk
      });
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("加载AI预测失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge variant="default">低风险</Badge>;
      case 'medium':
        return <Badge variant="secondary">中等风险</Badge>;
      case 'high':
        return <Badge variant="destructive">高风险</Badge>;
      case 'critical':
        return <Badge variant="destructive">严重风险</Badge>;
      default:
        return <Badge variant="outline">未知风险</Badge>;
    }
  };

  const getTrendIcon = (direction: "up" | "down" | "stable") => {
    switch (direction) {
      case "up": return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <MinusIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRiskLevelClass = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case "critical":
        return "严重";
      case "high":
        return "高风险";
      case "medium":
        return "中等";
      default:
        return "低风险";
    }
  };

  return (
    <Card className={cn("col-span-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BrainCircuitIcon className="h-4 w-4" />
            AI 智能预测
          </CardTitle>
          <CardDescription>
            {lastUpdated ? `最后更新: ${lastUpdated}` : '加载中...'}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : predictions.supplyChain ? (
          <div className="space-y-4">
            {/* 供应链风险 */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">供应链风险</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  预计影响时间: {predictions.supplyChain.timeToImpact}
                </p>
              </div>
              {getRiskLevelBadge(predictions.supplyChain.riskLevel)}
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">主要风险因素:</p>
                {predictions.supplyChain.riskFactors.map((factor, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm">{factor.name}</p>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                    <ul className="text-sm list-disc list-inside pl-4 space-y-1">
                      {factor.mitigationStrategies.map((strategy, idx) => (
                        <li key={idx}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">受影响产品:</p>
                {predictions.supplyChain.affectedProducts.map((product, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{product.productName}</span>
                    <span>影响程度: {(product.estimatedImpact * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">无法加载预测数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 