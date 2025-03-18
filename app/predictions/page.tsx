"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesForecastChart } from "@/components/SalesForecastChart";
import { SupplyChainRiskCard } from "@/components/SupplyChainRiskCard";
import { InventoryOptimizationCard } from "@/components/InventoryOptimizationCard";
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  AlertTriangleIcon, 
  PackageIcon, 
  RefreshCwIcon,
  BrainCircuitIcon
} from "lucide-react";

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("1");
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long">("medium");
  const [selectedWarehouse, setSelectedWarehouse] = useState("warehouse-1");

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI 预测分析</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
            className={isLoading ? "animate-spin" : ""}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BrainCircuitIcon className="h-5 w-5 text-primary" />
            <CardTitle>智能预测引擎</CardTitle>
          </div>
          <CardDescription>
            基于历史数据和市场趋势，AI 引擎提供多维度预测分析，帮助您做出更明智的决策
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                <span>销售预测</span>
              </TabsTrigger>
              <TabsTrigger value="supply-chain" className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4" />
                <span>供应链风险</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4" />
                <span>库存优化</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="mt-6">
              <div className="grid gap-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">选择产品</label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择产品" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">iPhone 15 Pro</SelectItem>
                        <SelectItem value="2">AirPods Pro</SelectItem>
                        <SelectItem value="3">MacBook Pro 14</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">预测时间范围</label>
                    <Select 
                      value={timeframe} 
                      onValueChange={(value) => setTimeframe(value as "short" | "medium" | "long")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择时间范围" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">短期 (3个月)</SelectItem>
                        <SelectItem value="medium">中期 (4个季度)</SelectItem>
                        <SelectItem value="long">长期 (2年)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-none">
                    <label className="text-sm font-medium mb-1 block opacity-0">刷新</label>
                    <Button onClick={handleRefresh} disabled={isLoading}>
                      {isLoading ? "分析中..." : "生成预测"}
                    </Button>
                  </div>
                </div>
                
                <SalesForecastChart 
                  productId={selectedProduct} 
                  timeframe={timeframe} 
                  isLoading={isLoading} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="supply-chain" className="mt-6">
              <SupplyChainRiskCard isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="inventory" className="mt-6">
              <div className="grid gap-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">选择仓库</label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择仓库" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warehouse-1">仓库一</SelectItem>
                        <SelectItem value="warehouse-2">仓库二</SelectItem>
                        <SelectItem value="warehouse-3">仓库三</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-none">
                    <label className="text-sm font-medium mb-1 block opacity-0">刷新</label>
                    <Button onClick={handleRefresh} disabled={isLoading}>
                      {isLoading ? "分析中..." : "生成优化建议"}
                    </Button>
                  </div>
                </div>
                
                <InventoryOptimizationCard 
                  warehouseId={selectedWarehouse} 
                  isLoading={isLoading} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 