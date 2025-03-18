import type { Order, InventoryItem } from "@/lib/data";
import type { DatabaseService } from "./database";

export interface AIInsight {
  type: 'sales' | 'inventory' | 'supply_chain';
  title: string;
  description: string;
  recommendations: string[];
}

export interface OrderAnalysis {
  orderId: string;
  orderNumber: string;
  analysisType: 'inbound' | 'outbound';
  findings: {
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }[];
  summary: string;
  riskScore: number;
  relatedOrders?: string[];
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  anomalyType?: string;
  confidence: number;
  details: string;
  suggestedActions: string[];
}

export interface SalesPrediction {
  date: string;
  revenue: number;
  quantity: number;
  growthRate: number;
  upperBound: number;
  lowerBound: number;
  productName: string;
  overallConfidence: number;
  trends: Array<{
    period: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    description: string;
  }>;
}

export interface SupplyChainRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  timeToImpact: string;
  riskFactors: {
    name: string;
    description: string;
    impact: number;
    probability: number;
    mitigationStrategies: string[];
  }[];
  affectedProducts: {
    productName: string;
    estimatedImpact: number;
  }[];
}

export interface InventoryOptimizationSuggestion {
  type: 'layout' | 'process' | 'staffing' | 'technology';
  title: string;
  description: string;
  impact: {
    efficiency: number;
    cost: number;
  };
  priority: 'low' | 'medium' | 'high';
  implementationTime: string;
}

export class AIService {
  async generateInsights(data: {
    orders: Order[];
    inventory: InventoryItem[];
    timeRange: { start: Date; end: Date };
  }): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // 分析订单数据
    const orderInsights = await this.analyzeOrderTrends(data.orders);
    insights.push(...orderInsights);
    
    // 分析库存数据
    const inventoryInsights = this.analyzeInventory(data.inventory);
    insights.push(...inventoryInsights);
    
    // 分析供应链
    const supplyChainInsights = await this.analyzeSupplyChain(data.orders, data.inventory);
    insights.push(...supplyChainInsights);
    
    return insights;
  }

  async analyzeOrder(order: Order): Promise<OrderAnalysis> {
    // 分析单个订单
    const findings = [];
    
    // 基本订单检查
    findings.push({
      category: '基本信息',
      description: `订单${order.order_number}的基本信息分析`,
      severity: 'low' as const,
      recommendations: ['确保所有必要字段已填写']
    });

    // 价格异常检测
    if (order.value / order.quantity > 1000) {
      findings.push({
        category: '价格异常',
        description: '单价异常偏高',
        severity: 'high' as const,
        recommendations: ['复核定价', '检查是否有特殊定价政策']
      });
    }

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      analysisType: order.type,
      findings,
      summary: '订单分析完成',
      riskScore: findings.filter(f => f.severity === 'high').length * 0.3,
      relatedOrders: []
    };
  }

  async analyzeOrders(orders: Order[]): Promise<OrderAnalysis[]> {
    return Promise.all(orders.map(order => this.analyzeOrder(order)));
  }

  async detectAnomalies(order: Order): Promise<AnomalyDetectionResult> {
    // 异常检测逻辑
    const anomalies = [];
    let isAnomaly = false;
    let anomalyType = undefined;
    let confidence = 0;
    const suggestedActions = [];

    // 检查数量异常
    if (order.quantity > 1000) {
      isAnomaly = true;
      anomalyType = '数量异常';
      confidence = 0.8;
      suggestedActions.push('复核订单数量');
    }

    // 检查价格异常
    if (order.value / order.quantity > 1000) {
      isAnomaly = true;
      anomalyType = '价格异常';
      confidence = 0.9;
      suggestedActions.push('复核订单价格');
    }

    return {
      isAnomaly,
      anomalyType,
      confidence,
      details: '异常检测完成',
      suggestedActions
    };
  }

  private async analyzeOrderTrends(orders: Order[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // 分析订单趋势
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const completionRate = (completedOrders / totalOrders) * 100;
    
    insights.push({
      type: 'sales',
      title: '订单完成率分析',
      description: `订单完成率为 ${completionRate.toFixed(1)}%`,
      recommendations: [
        completionRate < 80 ? '需要提高订单处理效率' : '保持良好的处理效率',
      ]
    });
    
    return insights;
  }

  private analyzeInventory(inventory: InventoryItem[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // 分析库存状态
    const lowStockItems = inventory.filter(i => i.status === 'low_stock');
    if (lowStockItems.length > 0) {
      insights.push({
        type: 'inventory',
        title: '库存预警',
        description: `${lowStockItems.length} 个商品库存偏低`,
        recommendations: [
          '及时补充库存',
          '检查供应链是否存在问题'
        ]
      });
    }
    
    return insights;
  }

  private async analyzeSupplyChain(orders: Order[], inventory: InventoryItem[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // 分析供应链风险
    const riskAssessment = await this.predictSupplyChainRisks();
    if (riskAssessment.riskLevel !== 'low') {
      insights.push({
        type: 'supply_chain',
        title: '供应链风险警告',
        description: `检测到${riskAssessment.riskLevel}级别的供应链风险`,
        recommendations: riskAssessment.riskFactors.map(f => f.mitigationStrategies[0])
      });
    }
    
    return insights;
  }

  async predictSupplyChainRisks(): Promise<SupplyChainRisk> {
    // 模拟供应链风险预测
    return {
      riskLevel: 'medium',
      riskScore: 0.6,
      timeToImpact: '2周',
      riskFactors: [
        {
          name: '供应商延迟',
          description: '主要供应商交付时间延长',
          impact: 0.7,
          probability: 0.6,
          mitigationStrategies: ['寻找备选供应商', '提前下单']
        }
      ],
      affectedProducts: [
        {
          productName: 'iPhone 15 Pro',
          estimatedImpact: 0.4
        }
      ]
    };
  }

  async getInventoryOptimizationSuggestions(warehouseId: string): Promise<InventoryOptimizationSuggestion[]> {
    // 模拟库存优化建议
    return [
      {
        type: 'layout',
        title: '优化仓库布局',
        description: '根据商品流转频率调整存放位置',
        impact: {
          efficiency: 15,
          cost: -5000
        },
        priority: 'high',
        implementationTime: '2周'
      }
    ];
  }

  async forecastSales(productId: string, timeframe: "short" | "medium" | "long"): Promise<SalesPrediction[]> {
    // 模拟销售预测数据
    const periods = timeframe === "short" ? 3 : timeframe === "medium" ? 4 : 8;
    const predictions: SalesPrediction[] = [];

    for (let i = 0; i < periods; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      predictions.push({
        date: date.toISOString(),
        revenue: 100000 + Math.random() * 50000,
        quantity: 100 + Math.floor(Math.random() * 50),
        growthRate: 0.1 + Math.random() * 0.2,
        upperBound: 120000 + Math.random() * 50000,
        lowerBound: 80000 + Math.random() * 50000,
        productName: "iPhone 15 Pro",
        overallConfidence: 0.85,
        trends: [
          {
            period: `第${i + 1}${timeframe === "short" ? "月" : timeframe === "medium" ? "季度" : "半年"}`,
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.random() * 0.2,
            description: "基于历史数据分析"
          }
        ]
      });
    }

    return predictions;
  }
}

export const aiService = new AIService();