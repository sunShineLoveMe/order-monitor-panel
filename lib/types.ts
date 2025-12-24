export interface Order {
  id: string;
  order_number: string;
  customer: string;
  customer_name?: string;
  product_name: string;
  quantity: number;
  value: number;
  status: 'completed' | 'processing' | 'pending' | 'exception';
  date: string;
  type: 'inbound' | 'outbound';
  created_at: string;
  updated_at: string;
  exceptions?: Array<{
    type: string;
    description: string;
    created_at: string;
    resolved_at?: string;
    status: 'open' | 'resolved';
  }>;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  threshold: number;
  location: string;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  supplier: string;
}

// n8n 工作流执行记录类型
export interface N8nExecution {
  id: string;
  orderId?: string;          // 从 execution_data 中提取的订单ID
  workflowId: string;
  workflowName: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  executionTime?: number;    // 执行耗时（毫秒）
  triggerType: string;       // manual / webhook / schedule
  nodeCount: number;         // 节点数量
  retryCount?: number;       // 重试次数
}

// 智能洞察仪表盘汇总数据
export interface AnalyticsSummary {
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  runningCount: number;
  avgExecutionTime: number;
  successRate: number;
  executionsByHour: { hour: string; count: number }[];
  executionsByStatus: { status: string; count: number; color: string }[];
  topOrders: { orderId: string; executionCount: number }[];
  recentExecutions: N8nExecution[];
} 