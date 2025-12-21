"use client";

import { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/services/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  User,
  Activity,
  AlertCircle,
  CheckCircle2,
  Package,
  ArrowUp,
  ArrowDown,
  CreditCard,
  LayoutDashboard,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BrainCircuit
} from "lucide-react";
import { Overview } from "@/components/Overview";
import { RecentOrders } from "@/components/RecentOrders";
import { Button } from "@/components/ui/button";
import AIInsightCard from "@/components/AIInsightCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AIPredictionCard from "@/components/AIPredictionCard";
import { InventoryHeatmap } from "@/components/InventoryHeatmap";
import { SalesTrendChart } from "@/components/SalesTrendChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AISalesProfitForecast } from "@/components/AISalesProfitForecast";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DatabaseService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num: number) => num?.toLocaleString() || "0";
  const formatPercent = (num: number) => (num > 0 ? "+" : "") + num?.toFixed(1) + "%";
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">数据面板</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总库存量</CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : formatNumber(stats?.totalInventory)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">正常</span> 运行中
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
        
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理订单</CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : formatNumber(stats?.activeOrders)}</div>
            <p className="text-xs text-muted-foreground">
              当前实时处理条目
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
        
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">异常率 (AI判定)</CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.exceptionRate}%</div>
            <p className="text-xs text-muted-foreground">
              基于全时态数据扫描
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
        
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统运行效率</CardTitle>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 1.2%</span> 较昨日提升
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="ai">AI 智能分析</TabsTrigger>
          <TabsTrigger value="inventory">库存管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>总览</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>最近订单</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>库存周转率</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center">
                  <div className="mr-4 space-y-1">
                    <p className="text-sm font-medium leading-none">总体周转率</p>
                    <p className="text-sm text-muted-foreground">上月平均</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">4.2</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 space-y-1">
                    <p className="text-sm font-medium leading-none">高需求品类</p>
                    <p className="text-sm text-muted-foreground">电子产品</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">6.8</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 space-y-1">
                    <p className="text-sm font-medium leading-none">低需求品类</p>
                    <p className="text-sm text-muted-foreground">办公用品</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-500">2.1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="col-span-2">
              <AISalesProfitForecast />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AIPredictionCard />
            <SalesTrendChart className="col-span-2" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>AI 智能决策支持</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 border rounded-md">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">库存优化</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI预测未来3个月iPhone 15需求将增长25%，建议提前增加库存。
                      </p>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">置信度:</span>
                        <span className="font-medium text-green-500">92%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-md">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">供应链风险</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        检测到供应商A可能存在交付延迟风险，建议启动备选供应商计划。
                      </p>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">风险等级:</span>
                        <span className="font-medium text-yellow-500">中等</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-md">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">价格策略</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        基于市场分析，建议对AirPods Pro进行15%的促销折扣以提升销量。
                      </p>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">预计收益:</span>
                        <span className="font-medium text-green-500">+18%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <InventoryHeatmap />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>库存优化建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">增加热销产品库存</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        iPhone 15 Pro和iPad Pro在北京仓库库存不足，建议增加30%的安全库存。
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">减少过剩库存</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        AirPods Pro在广州仓库库存过高，建议减少采购并考虑促销活动。
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">库存重新分配</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        建议将上海仓库的MacBook Air部分库存转移至北京仓库，以平衡区域需求。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>库存健康指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">总体库存健康度</p>
                      <p className="text-sm font-medium text-green-500">78%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">库存周转率</p>
                      <p className="text-sm font-medium text-yellow-500">4.2次/月</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-yellow-500" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">库存准确率</p>
                      <p className="text-sm font-medium text-green-500">95%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: "95%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">订单满足率</p>
                      <p className="text-sm font-medium text-green-500">92%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
