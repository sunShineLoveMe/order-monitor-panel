"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { aiService, type SupplyChainRisk } from "@/lib/services/ai";
import { AlertTriangleIcon, ShieldAlertIcon, ShieldCheckIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface SupplyChainRiskCardProps {
  isLoading: boolean;
}

export function SupplyChainRiskCard({ isLoading }: SupplyChainRiskCardProps) {
  const [riskData, setRiskData] = useState<SupplyChainRisk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRiskData = async () => {
      setLoading(true);
      try {
        const data = await aiService.predictSupplyChainRisks();
        setRiskData(data);
      } catch (error) {
        console.error("加载供应链风险数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRiskData();
  }, [isLoading]);

  if (loading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>供应链风险分析</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!riskData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>供应链风险分析</CardTitle>
          <CardDescription>无法加载风险数据</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">数据加载失败，请重试</p>
        </CardContent>
      </Card>
    );
  }

  // 获取风险等级图标和颜色
  const getRiskLevelIcon = (level: "low" | "medium" | "high" | "critical") => {
    switch (level) {
      case "low":
        return <ShieldCheckIcon className="h-6 w-6 text-green-500" />;
      case "medium":
        return <AlertCircleIcon className="h-6 w-6 text-yellow-500" />;
      case "high":
        return <ShieldAlertIcon className="h-6 w-6 text-orange-500" />;
      case "critical":
        return <AlertTriangleIcon className="h-6 w-6 text-red-500" />;
    }
  };

  const getRiskLevelColor = (level: "low" | "medium" | "high" | "critical") => {
    switch (level) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "critical": return "bg-red-500";
    }
  };

  const getRiskLevelText = (level: "low" | "medium" | "high" | "critical") => {
    switch (level) {
      case "low": return "低风险";
      case "medium": return "中等风险";
      case "high": return "高风险";
      case "critical": return "严重风险";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>供应链风险分析</CardTitle>
            <CardDescription>预计影响时间: {
              riskData.timeToImpact === "immediate" ? "立即" :
              riskData.timeToImpact === "within 30 days" ? "30天内" :
              riskData.timeToImpact === "within 90 days" ? "90天内" : riskData.timeToImpact
            }</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getRiskLevelIcon(riskData.riskLevel)}
            <div>
              <div className="text-sm font-medium">{getRiskLevelText(riskData.riskLevel)}</div>
              <div className="text-xs text-muted-foreground">风险分数: {Math.round(riskData.riskScore * 100)}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">风险因素分析</h3>
          <div className="space-y-4">
            {riskData.riskFactors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{factor.name}</div>
                  <div className="text-xs text-muted-foreground">
                    影响: {Math.round(factor.impact * 100)}% | 
                    概率: {Math.round(factor.probability * 100)}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{factor.description}</div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full",
                      factor.impact > 0.7 ? "bg-red-500" :
                      factor.impact > 0.4 ? "bg-orange-500" : "bg-yellow-500"
                    )}
                    style={{ width: `${factor.probability * 100}%` }}
                  ></div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {factor.mitigationStrategies.map((strategy, i) => (
                    <span key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {strategy}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">受影响产品</h3>
          <div className="space-y-3">
            {riskData.affectedProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-medium">{product.productName}</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-1.5">
                    <div 
                      className={cn(
                        "h-1.5 rounded-full",
                        product.estimatedImpact > 0.5 ? "bg-red-500" :
                        product.estimatedImpact > 0.3 ? "bg-orange-500" : "bg-yellow-500"
                      )}
                      style={{ width: `${product.estimatedImpact * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(product.estimatedImpact * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span>风险评估基于历史数据和市场趋势</span>
          <span>更新时间: {new Date().toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
} 