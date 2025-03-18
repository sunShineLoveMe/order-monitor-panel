import { Order, exceptionTypes, mockOrders } from "@/lib/data";
import { AnomalyDetectionResult, OrderAnalysis, aiService } from "./ai";

export type ExceptionHandlingResult = {
  orderId: string;
  orderNumber: string;
  exceptionType: string;
  detectedAt: string;
  status: "pending" | "processing" | "resolved" | "escalated";
  assignedTo?: string;
  priority: "low" | "medium" | "high";
  autoResolutionApplied: boolean;
  resolutionSteps: {
    action: string;
    timestamp: string;
    automated: boolean;
    result?: string;
  }[];
  estimatedResolutionTime?: string;
  relatedOrders?: string[];
};

export type AutoResolutionRule = {
  exceptionType: string;
  conditions: {
    field: string;
    operator: "equals" | "contains" | "greaterThan" | "lessThan";
    value: any;
  }[];
  actions: {
    type: "notify" | "escalate" | "adjust" | "reassign" | "cancel";
    target?: string;
    value?: any;
    message?: string;
  }[];
  priority: "low" | "medium" | "high";
};

class ExceptionHandlingService {
  private autoResolutionRules: AutoResolutionRule[] = [
    {
      exceptionType: "订单不匹配",
      conditions: [
        { field: "value", operator: "lessThan", value: 10000 }
      ],
      actions: [
        { type: "notify", target: "supplier", message: "订单信息不匹配，请确认" },
        { type: "adjust", target: "status", value: "processing" }
      ],
      priority: "medium"
    },
    {
      exceptionType: "库存不足",
      conditions: [
        { field: "quantity", operator: "lessThan", value: 50 }
      ],
      actions: [
        { type: "notify", target: "inventory", message: "库存不足，需要补货" },
        { type: "escalate", target: "inventory_manager" }
      ],
      priority: "high"
    },
    {
      exceptionType: "质量问题",
      conditions: [
        { field: "type", operator: "equals", value: "inbound" }
      ],
      actions: [
        { type: "notify", target: "quality_control", message: "产品质量问题，需要检查" },
        { type: "reassign", target: "quality_team" }
      ],
      priority: "high"
    },
    {
      exceptionType: "价格异常",
      conditions: [
        { field: "value", operator: "greaterThan", value: 100000 }
      ],
      actions: [
        { type: "notify", target: "finance", message: "订单价格异常，需要审核" },
        { type: "escalate", target: "finance_manager" }
      ],
      priority: "medium"
    }
  ];

  private exceptionHistory: Map<string, ExceptionHandlingResult> = new Map();
  private subscribers: Set<(exceptions: ExceptionHandlingResult[]) => void> = new Set();

  // 检测并处理异常订单
  async detectAndHandleExceptions(orders: Order[]): Promise<ExceptionHandlingResult[]> {
    const results: ExceptionHandlingResult[] = [];
    
    for (const order of orders) {
      // 检查是否已经处理过
      if (this.exceptionHistory.has(order.id)) {
        results.push(this.exceptionHistory.get(order.id)!);
        continue;
      }
      
      // 检测异常
      const anomalyResult = await aiService.detectAnomalies(order);
      
      // 如果是异常订单或状态为exception，则处理
      if (anomalyResult.isAnomaly || order.status === "exception") {
        const analysisResult = await aiService.analyzeOrder(order);
        const handlingResult = await this.handleException(order, anomalyResult, analysisResult);
        
        this.exceptionHistory.set(order.id, handlingResult);
        results.push(handlingResult);
        
        // 通知订阅者
        this.notifySubscribers();
      }
    }
    
    return results;
  }

  // 处理单个异常订单
  private async handleException(
    order: Order, 
    anomalyResult: AnomalyDetectionResult,
    analysisResult: OrderAnalysis
  ): Promise<ExceptionHandlingResult> {
    // 确定异常类型
    const exceptionType = anomalyResult.isAnomaly && anomalyResult.anomalyType
      ? anomalyResult.anomalyType
      : this.determineExceptionType(order, analysisResult);
    
    // 查找适用的自动处理规则
    const applicableRules = this.findApplicableRules(order, exceptionType);
    
    // 创建异常处理结果
    const result: ExceptionHandlingResult = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      exceptionType,
      detectedAt: new Date().toISOString(),
      status: "pending",
      priority: "medium",
      autoResolutionApplied: false,
      resolutionSteps: []
    };
    
    // 应用自动处理规则
    if (applicableRules.length > 0) {
      result.autoResolutionApplied = true;
      result.status = "processing";
      
      // 添加自动处理步骤
      for (const rule of applicableRules) {
        for (const action of rule.actions) {
          result.resolutionSteps.push({
            action: this.getActionDescription(action),
            timestamp: new Date().toISOString(),
            automated: true,
            result: "已自动执行"
          });
          
          // 如果是升级操作，更新状态
          if (action.type === "escalate") {
            result.status = "escalated";
            result.assignedTo = action.target;
          }
        }
      }
      
      // 估计解决时间
      result.estimatedResolutionTime = this.estimateResolutionTime(result.priority);
    }
    
    return result;
  }

  // 确定异常类型
  private determineExceptionType(order: Order, analysis: OrderAnalysis): string {
    // 基于分析结果确定异常类型
    const highSeverityFindings = analysis.findings.filter(f => f.severity === 'high');
    
    if (highSeverityFindings.length > 0) {
      // 返回第一个高严重性问题的类型
      return highSeverityFindings[0].category;
    }
    
    // 如果没有高严重性问题，但风险分数较高
    if (analysis.riskScore > 0.7) {
      return "high_risk";
    }
    
    // 默认异常类型
    return "general_exception";
  }

  // 查找适用的自动处理规则
  private findApplicableRules(order: Order, exceptionType: string): AutoResolutionRule[] {
    return this.autoResolutionRules.filter(rule => {
      // 检查异常类型是否匹配
      if (rule.exceptionType !== exceptionType) return false;
      
      // 检查所有条件是否满足
      return rule.conditions.every(condition => {
        const fieldValue = (order as any)[condition.field];
        
        switch (condition.operator) {
          case "equals":
            return fieldValue === condition.value;
          case "contains":
            return String(fieldValue).includes(condition.value);
          case "greaterThan":
            return fieldValue > condition.value;
          case "lessThan":
            return fieldValue < condition.value;
          default:
            return false;
        }
      });
    });
  }

  // 获取操作描述
  private getActionDescription(action: AutoResolutionRule["actions"][0]): string {
    switch (action.type) {
      case "notify":
        return `通知${action.target}: ${action.message}`;
      case "escalate":
        return `升级给${action.target}`;
      case "adjust":
        return `调整${action.target}为${action.value}`;
      case "reassign":
        return `重新分配给${action.target}`;
      case "cancel":
        return "取消订单";
      default:
        return "未知操作";
    }
  }

  // 估计解决时间
  private estimateResolutionTime(priority: "low" | "medium" | "high"): string {
    const now = new Date();
    let hours = 0;
    
    switch (priority) {
      case "high":
        hours = 2 + Math.floor(Math.random() * 2); // 2-4小时
        break;
      case "medium":
        hours = 8 + Math.floor(Math.random() * 16); // 8-24小时
        break;
      case "low":
        hours = 24 + Math.floor(Math.random() * 24); // 24-48小时
        break;
    }
    
    now.setHours(now.getHours() + hours);
    return now.toISOString();
  }

  // 手动处理异常
  async manuallyHandleException(
    orderId: string, 
    action: string, 
    result: string
  ): Promise<ExceptionHandlingResult | null> {
    if (!this.exceptionHistory.has(orderId)) return null;
    
    const handlingResult = this.exceptionHistory.get(orderId)!;
    
    // 添加手动处理步骤
    handlingResult.resolutionSteps.push({
      action,
      timestamp: new Date().toISOString(),
      automated: false,
      result
    });
    
    // 更新状态
    handlingResult.status = "resolved";
    
    // 更新历史记录
    this.exceptionHistory.set(orderId, handlingResult);
    
    // 通知订阅者
    this.notifySubscribers();
    
    return handlingResult;
  }

  // 获取所有异常处理记录
  getAllExceptionResults(): ExceptionHandlingResult[] {
    return Array.from(this.exceptionHistory.values());
  }

  // 获取单个异常处理记录
  getExceptionResult(orderId: string): ExceptionHandlingResult | null {
    return this.exceptionHistory.get(orderId) || null;
  }

  // 添加订阅者
  subscribe(callback: (exceptions: ExceptionHandlingResult[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // 通知订阅者
  private notifySubscribers(): void {
    const exceptions = this.getAllExceptionResults();
    Array.from(this.subscribers).forEach(subscriber => {
      subscriber(exceptions);
    });
  }

  // 添加自定义处理规则
  addCustomRule(rule: AutoResolutionRule): void {
    this.autoResolutionRules.push(rule);
  }

  // 获取所有处理规则
  getAllRules(): AutoResolutionRule[] {
    return [...this.autoResolutionRules];
  }
}

export const exceptionService = new ExceptionHandlingService(); 