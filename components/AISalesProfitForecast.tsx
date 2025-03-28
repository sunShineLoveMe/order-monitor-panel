"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart 
} from "recharts";
import { 
  BrainCircuitIcon, 
  TrendingUpIcon, 
  LineChartIcon, 
  BarChart3Icon, 
  RefreshCwIcon,
  GaugeIcon,
  ArrowRightIcon,
  ScanLineIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 预测数据类型
interface ForecastData {
  month: string;
  sales: number;
  salesPredicted: boolean;
  profit: number;
  profitPredicted: boolean;
  confidence: number;
  forecastDate: string;
}

// 模拟预测数据生成函数
const generateForecastData = (): ForecastData[] => {
  const currentDate = new Date();
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const data: ForecastData[] = [];
  
  // 生成过去3个月的历史数据
  for (let i = -3; i < 0; i++) {
    const monthIndex = (currentDate.getMonth() + i + 12) % 12;
    const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + i) / 12);
    
    const baseSales = 70 + Math.floor(Math.random() * 30);
    const sales = baseSales + Math.floor(Math.random() * 20 - 10);
    const profit = Math.floor(sales * (0.25 + Math.random() * 0.1));
    
    data.push({
      month: `${year}年${months[monthIndex]}`,
      sales,
      salesPredicted: false,
      profit,
      profitPredicted: false,
      confidence: 100,
      forecastDate: new Date().toISOString()
    });
  }
  
  // 生成未来6个月的预测数据
  for (let i = 0; i < 6; i++) {
    const monthIndex = (currentDate.getMonth() + i) % 12;
    const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + i) / 12);
    
    const growthTrend = 1 + (i * 0.05);
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    const prevSales = i > 0 ? data[data.length - 1].sales : data[data.length - 1].sales;
    const prevProfit = i > 0 ? data[data.length - 1].profit : data[data.length - 1].profit;
    
    const baseSales = prevSales * growthTrend * randomFactor;
    const sales = Math.floor(baseSales);
    const profit = Math.floor(sales * (0.25 + Math.random() * 0.1));
    const confidence = Math.max(50, 95 - i * 8);
    
    data.push({
      month: `${year}年${months[monthIndex]}`,
      sales,
      salesPredicted: true,
      profit,
      profitPredicted: true,
      confidence,
      forecastDate: new Date().toISOString()
    });
  }
  
  return data;
}; 

// 自定义工具提示组件
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const isPredicted = item.salesPredicted;
    
    return (
      <div className="bg-background/95 backdrop-blur-sm border p-2 rounded-md shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <div className="grid gap-1 mt-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span style={{ color: entry.color }}>
                {entry.name === 'sales' ? '销售额: ' : 
                 entry.name === 'profit' ? '利润: ' : entry.name}
              </span>
              <span className="font-medium">
                ¥{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
          {isPredicted && (
            <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-border/40">
              <span className="text-muted-foreground flex items-center">
                <GaugeIcon className="h-3 w-3 mr-1" />
                置信度:
              </span>
              <span className={`font-medium ${
                item.confidence > 80 ? 'text-green-500' : 
                item.confidence > 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {item.confidence}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function AISalesProfitForecast() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [activeView, setActiveView] = useState<'sales' | 'profit' | 'combined'>('combined');
  const [isLoading, setIsLoading] = useState(true);
  const [accuracyRate, setAccuracyRate] = useState(92);
  const [confidentPrediction, setConfidentPrediction] = useState("");
  
  useEffect(() => {
    // 模拟API调用延迟
    const timer = setTimeout(() => {
      setData(generateForecastData());
      setIsLoading(false);
      
      // 生成最有信心的预测
      const confidences = [
        "销售额预计在2024年12月达到峰值",
        "利润率将在下两个季度持续稳定增长",
        "销售与利润比率将维持在历史平均水平",
        "季节性因素将影响Q4销售额，但利润率预计保持稳定"
      ];
      setConfidentPrediction(confidences[Math.floor(Math.random() * confidences.length)]);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateForecastData());
      setIsLoading(false);
    }, 800);
  };
  
  // 计算平均置信度
  const averageConfidence = data.length > 0 
    ? Math.floor(data.filter(d => d.salesPredicted).reduce((acc, d) => acc + d.confidence, 0) / 
      data.filter(d => d.salesPredicted).length) 
    : 0;
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center">
            <BrainCircuitIcon className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-base">AI销售与利润预测</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <ScanLineIcon className="h-3 w-3 mr-1" />
              AI预测精度: {accuracyRate}%
            </Badge>
            <Button variant="outline" size="icon" onClick={refreshData}>
              <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <Tabs defaultValue="combined" onValueChange={(value) => setActiveView(value as any)}>
          <TabsList className="mb-2 h-8">
            <TabsTrigger value="combined" className="text-xs h-7">
              <LineChartIcon className="h-3.5 w-3.5 mr-1" />
              组合视图
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-xs h-7">
              <BarChart3Icon className="h-3.5 w-3.5 mr-1" />
              销售额
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs h-7">
              <TrendingUpIcon className="h-3.5 w-3.5 mr-1" />
              利润
            </TabsTrigger>
          </TabsList>
          
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1"></div>
                  <span className="text-xs text-muted-foreground">AI正在分析市场数据...</span>
                </div>
              </div>
            )}
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `¥${value.toLocaleString()}`} 
                    tick={{ fontSize: 10 }} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={30} 
                    formatter={(value) => {
                      return <span className="text-xs">{value === 'sales' ? '销售额' : value === 'profit' ? '利润' : value}</span>
                    }}
                  />
                  
                  {(activeView === 'combined' || activeView === 'sales') && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#6366F1"
                        strokeWidth={2}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.salesPredicted) {
                            return (
                              <svg x={cx - 4} y={cy - 4} width={8} height={8}>
                                <circle cx={4} cy={4} r={3} fill="#6366F1" />
                                <circle cx={4} cy={4} r={5} stroke="#6366F1" strokeWidth={0.5} fill="none" />
                              </svg>
                            );
                          }
                          return <circle cx={cx} cy={cy} r={3} fill="#6366F1" />;
                        }}
                        activeDot={{ r: 5, fill: '#6366F1' }}
                        isAnimationActive={!isLoading}
                        name="sales"
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        fill="url(#salesGradient)"
                        stroke="none"
                        isAnimationActive={!isLoading}
                      />
                    </>
                  )}
                  
                  {(activeView === 'combined' || activeView === 'profit') && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#EC4899"
                        strokeWidth={2}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.profitPredicted) {
                            return (
                              <svg x={cx - 4} y={cy - 4} width={8} height={8}>
                                <circle cx={4} cy={4} r={3} fill="#EC4899" />
                                <circle cx={4} cy={4} r={5} stroke="#EC4899" strokeWidth={0.5} fill="none" />
                              </svg>
                            );
                          }
                          return <circle cx={cx} cy={cy} r={3} fill="#EC4899" />;
                        }}
                        activeDot={{ r: 5, fill: '#EC4899' }}
                        isAnimationActive={!isLoading}
                        name="profit"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        fill="url(#profitGradient)"
                        stroke="none"
                        isAnimationActive={!isLoading}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mt-2 pt-1.5 border-t flex items-center text-xs text-muted-foreground rounded-md bg-muted/40 p-1.5 bg-primary/5">
            <BrainCircuitIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span className="font-medium">AI洞察: </span>
            <span className="ml-1">{confidentPrediction}</span>
            <span className="ml-auto flex items-center">
              <Badge variant="outline" className="text-[10px] py-0 px-1 h-4">
                <GaugeIcon className="h-2.5 w-2.5 mr-0.5" />
                {averageConfidence}%
              </Badge>
            </span>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 