"use client";

import { useEffect, useRef, useState } from "react";
import { mockOrders } from "@/lib/data";
import { cn } from "@/lib/utils";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CheckCircle2Icon, 
  ClockIcon, 
  AlertTriangleIcon,
  BarChart4Icon,
  TrendingUpIcon,
  ShieldIcon,
  CalendarIcon,
  BoxIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";

// 添加更多模拟订单数据，确保有足够的数据进行滚动
const extendedMockOrders: Order[] = [
  ...mockOrders,
  {
    id: "4",
    order_number: "OUT-20240302-001",
    customer: "客户D",
    type: "outbound",
    status: "completed",
    product_name: "MacBook Pro",
    quantity: 10,
    value: 30000,
    date: "2024-03-02",
    created_at: "2024-03-02T00:00:00Z",
    updated_at: "2024-03-02T01:30:00Z"
  },
  {
    id: "5",
    order_number: "IN-20240302-001",
    customer: "供应商B",
    type: "inbound",
    status: "processing",
    product_name: "iPad Pro",
    quantity: 80,
    value: 15000,
    date: "2024-03-02",
    created_at: "2024-03-02T02:15:00Z",
    updated_at: "2024-03-02T02:15:00Z"
  },
  {
    id: "6",
    order_number: "OUT-20240302-002",
    customer: "客户E",
    type: "outbound",
    status: "exception",
    product_name: "Apple Watch",
    quantity: 20,
    value: 8000,
    date: "2024-03-02",
    created_at: "2024-03-02T03:45:00Z",
    updated_at: "2024-03-02T04:20:00Z"
  },
  {
    id: "7",
    order_number: "IN-20240303-001",
    customer: "供应商D",
    type: "inbound",
    status: "completed",
    product_name: "Mac Mini",
    quantity: 30,
    value: 25000,
    date: "2024-03-03",
    created_at: "2024-03-03T09:10:00Z",
    updated_at: "2024-03-03T10:25:00Z"
  }
];

interface AIInsightData {
  type: string;
  message: string;
  score: number;
}

interface AIInsightsMap {
  [key: string]: AIInsightData;
}

export function RecentOrders() {
  const [visibleOrders, setVisibleOrders] = useState<Order[]>(extendedMockOrders.slice(0, 4));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI分析的附加信息
  const aiInsights: AIInsightsMap = {
    "1": { type: "efficiency", message: "处理时间低于平均水平15%", score: 86 },
    "2": { type: "risk", message: "预计72小时内完成", score: 78 },
    "3": { type: "prediction", message: "库存周转率提升12%", score: 92 },
    "4": { type: "efficiency", message: "客户满意度评分: 4.8/5", score: 96 },
    "5": { type: "prediction", message: "预计明日10:00完成处理", score: 84 },
    "6": { type: "risk", message: "建议优先处理异常", score: 65 },
    "7": { type: "efficiency", message: "价格合理性: 优", score: 90 }
  };

  useEffect(() => {
    // 自动滚动效果
    const interval = setInterval(() => {
      if (!animating) {
        setAnimating(true);
        const nextIndex = (currentIndex + 1) % extendedMockOrders.length;
        const newVisibleOrders: Order[] = [];
        
        // 保留最近的3个订单，添加1个新订单
        for (let i = 0; i < 4; i++) {
          const index = (nextIndex + i) % extendedMockOrders.length;
          newVisibleOrders.push(extendedMockOrders[index]);
        }
        
        setCurrentIndex(nextIndex);
        setTimeout(() => {
          setVisibleOrders(newVisibleOrders);
          setAnimating(false);
        }, 500);
      }
    }, 3000); // 每3秒滚动一次
    
    return () => clearInterval(interval);
  }, [currentIndex, animating]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2Icon className="h-4 w-4 text-green-500" />;
      case "processing":
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "exception":
        return <AlertTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "已完成";
      case "processing": return "处理中";
      case "pending": return "待处理";
      case "exception": return "异常";
      default: return "未知";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "secondary" as const;
      case "processing": return "default" as const;
      case "pending": return "outline" as const;
      case "exception": return "destructive" as const;
      default: return "outline" as const;
    }
  };

  const getAIInsightIcon = (insightType?: string) => {
    if (!insightType) return <BarChart4Icon className="h-4 w-4 text-gray-500" />;
    
    switch (insightType) {
      case "efficiency":
        return <BarChart4Icon className="h-4 w-4 text-primary" />;
      case "prediction":
        return <TrendingUpIcon className="h-4 w-4 text-purple-500" />;
      case "risk":
        return <ShieldIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <BarChart4Icon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">实时订单流</h3>
        <Badge variant="outline" className="text-xs">
          <ClockIcon className="h-3 w-3 mr-1" />
          实时更新中
        </Badge>
      </div>
      
      <div className="space-y-4">
        {visibleOrders.map((order) => {
          const insight = aiInsights[order.id];
          return (
            <div 
              key={order.id} 
              className="p-3 border rounded-lg transition-all duration-200 hover:bg-accent/50 hover:border-primary/20 group"
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    order.type === "inbound"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  )}
                >
                  {order.type === "inbound" ? (
                    <ArrowDownIcon className="h-5 w-5" />
                  ) : (
                    <ArrowUpIcon className="h-5 w-5" />
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold">
                        {order.order_number}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="mr-2 text-[10px] px-1">
                          {getStatusText(order.status)}
                        </Badge>
                        <span>
                          {order.customer} · {order.quantity} 件
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold">
                      ¥{order.value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t flex justify-between text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <BoxIcon className="h-3 w-3 mr-1" />
                      <span>{order.product_name}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{order.date}</span>
                    </div>
                  </div>
                  
                  {/* AI分析信息 */}
                  <div className="mt-1.5 flex items-center p-1.5 rounded-md bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100">
                    {getAIInsightIcon(insight?.type)}
                    <span className="text-xs ml-1.5 text-muted-foreground">{insight?.message || "正在分析中..."}</span>
                    <div className="ml-auto flex items-center">
                      <span className="text-xs mr-1">AI评分:</span>
                      <span className={`text-xs font-semibold ${getScoreColor(insight?.score)}`}>
                        {insight?.score || "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-2">
        <div className="flex space-x-1">
          {extendedMockOrders.map((_, index) => (
            <div 
              key={index}
              className={`h-1.5 w-5 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 4) * 4 <= index && index < Math.floor(currentIndex / 4) * 4 + 4
                  ? "bg-primary" 
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 