"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AIService } from "@/lib/services/ai";
import { 
  LayoutIcon, 
  ClipboardListIcon, 
  UsersIcon, 
  MonitorIcon,
  ChevronRightIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface OptimizationSuggestion {
  type: "layout" | "process" | "staffing" | "technology";
  title: string;
  description: string;
  impact: {
    efficiency: number;
    cost: number;
  };
  priority: "low" | "medium" | "high";
  implementationTime: string;
}

interface InventoryOptimizationCardProps {
  warehouseId: string;
  isLoading: boolean;
}

export function InventoryOptimizationCard({ warehouseId, isLoading }: InventoryOptimizationCardProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);

  useEffect(() => {
    loadOptimizationData();
  }, [warehouseId]);

  const loadOptimizationData = async () => {
    try {
      // 模拟优化建议数据
      const mockSuggestions: OptimizationSuggestion[] = [
        {
          type: "layout",
          title: "优化仓库布局",
          description: "根据商品流转频率重新规划存储区域",
          impact: {
            efficiency: 25,
            cost: 15000
          },
          priority: "high",
          implementationTime: "2-3周"
        },
        {
          type: "process",
          title: "简化入库流程",
          description: "通过自动化系统减少人工操作步骤",
          impact: {
            efficiency: 35,
            cost: 25000
          },
          priority: "medium",
          implementationTime: "1-2月"
        },
        {
          type: "technology",
          title: "引入RFID系统",
          description: "实现库存实时追踪和自动盘点",
          impact: {
            efficiency: 45,
            cost: 50000
          },
          priority: "high",
          implementationTime: "3-4月"
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("加载优化建议失败:", error);
    }
  };

  const getTypeIcon = (type: "layout" | "process" | "staffing" | "technology") => {
    switch (type) {
      case "layout":
        return <LayoutIcon className="h-4 w-4" />;
      case "process":
        return <ClipboardListIcon className="h-4 w-4" />;
      case "staffing":
        return <UsersIcon className="h-4 w-4" />;
      case "technology":
        return <MonitorIcon className="h-4 w-4" />;
    }
  };

  const getPriorityClass = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "text-blue-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-red-500";
    }
  };

  const getPriorityText = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "低优先级";
      case "medium":
        return "中优先级";
      case "high":
        return "高优先级";
    }
  };

  const formatEfficiency = (value: number) => {
    return `+${value}%`;
  };

  const formatCost = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>库存优化建议</CardTitle>
          <CardDescription>正在分析库存数据...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>库存优化建议</CardTitle>
        <CardDescription>基于AI分析的库存优化方案</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(suggestion.type)}
                  <span className="font-medium">{suggestion.title}</span>
                </div>
                <span className={`text-sm ${getPriorityClass(suggestion.priority)}`}>
                  {getPriorityText(suggestion.priority)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">效率提升</p>
                  <Progress value={suggestion.impact.efficiency} className="h-2" />
                  <p className="text-sm text-right mt-1">{formatEfficiency(suggestion.impact.efficiency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">预计成本</p>
                  <p className="text-sm text-right">{formatCost(suggestion.impact.cost)}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">预计实施时间: {suggestion.implementationTime}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">
          查看详细报告
          <ChevronRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
} 