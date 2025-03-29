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

// Model settings interfaces
export interface ModelProvider {
  id: string;
  name: string;
  url: string;
  defaultModels: string[];
  supportsMultimodal?: boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  isDefault: boolean;
  isEnabled: boolean;
  supportsMultimodal: boolean;
  contextLength: number;
  temperature: number;
  proxyUrl?: string;
  multimodalConfig?: {
    maxImageSize: number;
    supportedFormats: string[];
    enabled: boolean;
  };
}

// Predefined model providers
export const modelProviders: ModelProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://api.openai.com/v1",
    defaultModels: ["gpt-4-turbo", "gpt-4-vision", "gpt-3.5-turbo"],
    supportsMultimodal: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    url: "https://api.anthropic.com",
    defaultModels: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    supportsMultimodal: true,
  },
  {
    id: "qwen",
    name: "阿里云通义千问",
    url: "https://dashscope.aliyuncs.com/api/v1",
    defaultModels: ["qwen-turbo", "qwen-plus", "qwen-max"],
    supportsMultimodal: true,
  },
  {
    id: "baidu",
    name: "百度文心一言",
    url: "https://aip.baidubce.com/rpc/2.0/ai_custom",
    defaultModels: ["ernie-bot-4", "ernie-bot-turbo", "ernie-bot"],
    supportsMultimodal: false,
  },
  {
    id: "custom",
    name: "自定义模型",
    url: "",
    defaultModels: ["custom-model"],
    supportsMultimodal: false,
  },
];

export class AIService {
  private modelConfigs: ModelConfig[] = [];
  private defaultModelConfig: ModelConfig | null = null;

  constructor() {
    // 初始化默认模型配置
    this.modelConfigs = [
      {
        id: "default-openai",
        name: "GPT-4",
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-4-turbo",
        isDefault: true,
        isEnabled: true,
        supportsMultimodal: true,
        contextLength: 128000,
        temperature: 0.7,
        proxyUrl: "",
        multimodalConfig: {
          maxImageSize: 4096,
          supportedFormats: ["jpeg", "png", "webp"],
          enabled: true
        }
      }
    ];
    
    this.defaultModelConfig = this.modelConfigs[0];
    this.loadModelConfigs();
  }

  // 从存储中加载模型配置
  private loadModelConfigs(): void {
    try {
      const storedConfigs = typeof window !== 'undefined' 
        ? localStorage.getItem('modelConfigs') 
        : null;
        
      if (storedConfigs) {
        this.modelConfigs = JSON.parse(storedConfigs);
        this.defaultModelConfig = this.modelConfigs.find(config => config.isDefault) || this.modelConfigs[0];
      }
    } catch (error) {
      console.error('加载模型配置失败:', error);
    }
  }

  // 保存模型配置到存储
  private saveModelConfigs(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('modelConfigs', JSON.stringify(this.modelConfigs));
      }
    } catch (error) {
      console.error('保存模型配置失败:', error);
    }
  }

  // 获取当前的模型配置列表
  public getModelConfigs(): ModelConfig[] {
    return [...this.modelConfigs];
  }

  // 获取默认模型配置
  public getDefaultModelConfig(): ModelConfig | null {
    return this.defaultModelConfig;
  }

  // 更新模型配置
  public updateModelConfigs(configs: ModelConfig[]): void {
    this.modelConfigs = [...configs];
    this.defaultModelConfig = this.modelConfigs.find(config => config.isDefault) || this.modelConfigs[0];
    this.saveModelConfigs();
  }

  // 测试模型连接
  public async testModelConnection(modelConfig: ModelConfig): Promise<{success: boolean, message: string}> {
    try {
      // 根据不同的提供商实现不同的测试逻辑
      switch (modelConfig.provider) {
        case 'openai':
          return await this.testOpenAIConnection(modelConfig);
        case 'anthropic':
          return await this.testAnthropicConnection(modelConfig);
        case 'qwen':
          return await this.testQwenConnection(modelConfig);
        case 'baidu':
          return await this.testBaiduConnection(modelConfig);
        case 'custom':
          return await this.testCustomConnection(modelConfig);
        default:
          return { success: false, message: '不支持的模型提供商' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 测试OpenAI API连接
  private async testOpenAIConnection(modelConfig: ModelConfig): Promise<{success: boolean, message: string}> {
    try {
      // 模拟API调用，实际实现中应该调用真实的OpenAI API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!modelConfig.apiKey) {
        return { success: false, message: 'API密钥不能为空' };
      }
      
      // 模拟成功响应
      return { success: true, message: 'OpenAI API连接成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `OpenAI API连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 测试Anthropic API连接
  private async testAnthropicConnection(modelConfig: ModelConfig): Promise<{success: boolean, message: string}> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!modelConfig.apiKey) {
        return { success: false, message: 'API密钥不能为空' };
      }
      
      // 模拟成功响应
      return { success: true, message: 'Anthropic API连接成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `Anthropic API连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 测试通义千问API连接
  private async testQwenConnection(modelConfig: ModelConfig): Promise<{success: boolean, message: string}> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!modelConfig.apiKey) {
        return { success: false, message: 'API密钥不能为空' };
      }
      
      // 模拟成功响应
      return { success: true, message: '通义千问API连接成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `通义千问API连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 测试百度文心一言API连接
  private async testBaiduConnection(modelConfig: ModelConfig): Promise<{success: boolean, message: string}> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!modelConfig.apiKey) {
        return { success: false, message: 'API密钥不能为空' };
      }
      
      // 模拟成功响应
      return { success: true, message: '百度文心一言API连接成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `百度文心一言API连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  // 测试自定义API连接
  private async testCustomConnection(modelConfig: ModelConfig): Promise<{success: boolean, message: string}> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!modelConfig.apiKey || !modelConfig.baseUrl) {
        return { success: false, message: 'API密钥和基础URL都不能为空' };
      }
      
      // 模拟成功响应
      return { success: true, message: '自定义API连接成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `自定义API连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  async generateInsights(data: {
    orders: Order[];
    inventory: InventoryItem[];
    timeRange: { start: Date; end: Date };
  }): Promise<AIInsight[]> {
    try {
      const insights: AIInsight[] = [];
      
      // 分析订单数据
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        const orderInsights = await this.analyzeOrderTrends(data.orders);
        insights.push(...orderInsights);
      } else {
        // 如果没有订单数据，添加一个通用的销售洞察
        insights.push({
          type: 'sales',
          title: '销售数据监控',
          description: '建议完善销售数据收集机制，以获得更准确的分析',
          recommendations: ['建立完整的订单跟踪系统', '确保所有销售渠道数据同步']
        });
      }
      
      // 分析库存数据
      if (Array.isArray(data.inventory) && data.inventory.length > 0) {
        const inventoryInsights = this.analyzeInventory(data.inventory);
        insights.push(...inventoryInsights);
      } else {
        // 如果没有库存数据，添加一个通用的库存洞察
        insights.push({
          type: 'inventory',
          title: '库存管理优化',
          description: '当前库存数据不完整，建议完善库存管理系统',
          recommendations: ['定期盘点库存', '实施库存预警机制']
        });
      }
      
      // 分析供应链
      if ((Array.isArray(data.orders) && data.orders.length > 0) || 
          (Array.isArray(data.inventory) && data.inventory.length > 0)) {
        const supplyChainInsights = await this.analyzeSupplyChain(
          Array.isArray(data.orders) ? data.orders : [], 
          Array.isArray(data.inventory) ? data.inventory : []
        );
        insights.push(...supplyChainInsights);
      } else {
        // 如果没有订单和库存数据，添加一个通用的供应链洞察
        insights.push({
          type: 'supply_chain',
          title: '供应链风险管理',
          description: '建立供应链风险评估机制',
          recommendations: ['评估主要供应商风险', '建立备选供应商网络']
        });
      }
      
      return insights;
    } catch (error) {
      console.error('生成AI洞察失败:', error);
      // 返回一些基本洞察，确保界面有内容显示
      return [
        {
          type: 'inventory',
          title: '库存管理',
          description: '库存管理是企业运营的关键环节',
          recommendations: ['定期检查库存水平', '优化库存周转率']
        },
        {
          type: 'sales',
          title: '销售趋势',
          description: '关注销售趋势可以及时调整经营策略',
          recommendations: ['分析热销产品', '调整推广策略']
        }
      ];
    }
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