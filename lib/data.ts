export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  productName: string;
  quantity: number;
  value: number;
  status: "pending" | "processing" | "completed" | "exception";
  date: string;
  type: "inbound" | "outbound";
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  exceptions?: Array<{
    type: string;
    description: string;
    status: "open" | "resolved";
    createdAt: string;
    resolvedAt?: string;
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
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: string;
  supplier?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  supplier: string;
  leadTime: number;
  minOrderQuantity: number;
}

export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  exceptionOrders: number;
  totalInventoryValue: number;
  lowStockItems: number;
  monthlyGrowth: number;
  inventoryTurnover: number;
}

export type ExceptionInfo = {
  type: string;
  description: string;
  potentialSolutions: string[];
};

export type AIInsight = {
  id: string;
  category: "inventory" | "sales" | "supply_chain" | "efficiency" | "anomaly";
  title: string;
  summary: string;
  details: string;
  timestamp: string;
};

export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "IN-20240301-001",
    customer: "供应商A",
    type: "inbound",
    status: "completed",
    productName: "iPhone 15 Pro",
    quantity: 100,
    value: 10000,
    date: "2024-03-01",
    products: [
      {
        id: "iPhone 15 Pro",
        name: "iPhone 15 Pro",
        quantity: 100,
        price: 100
      }
    ],
  },
  {
    id: "2",
    orderNumber: "OUT-20240301-001",
    customer: "客户B",
    type: "outbound",
    status: "pending",
    productName: "iPhone 15 Pro",
    quantity: 50,
    value: 5000,
    date: "2024-03-01",
    products: [
      {
        id: "iPhone 15 Pro",
        name: "iPhone 15 Pro",
        quantity: 50,
        price: 100
      }
    ],
  },
  {
    id: "3",
    orderNumber: "IN-20240301-002",
    customer: "供应商C",
    type: "inbound",
    status: "exception",
    productName: "AirPods Pro",
    quantity: 200,
    value: 20000,
    date: "2024-03-01",
    products: [
      {
        id: "AirPods Pro",
        name: "AirPods Pro",
        quantity: 200,
        price: 100
      }
    ],
  },
];

export const mockInventoryData: InventoryItem[] = [
  {
    id: "1",
    name: "iPhone 15",
    sku: "iPhone 15",
    category: "手机",
    quantity: 100,
    threshold: 50,
    location: "北京",
    lastUpdated: "2024-03-10",
    price: 1000,
    status: "in_stock"
  },
  {
    id: "2",
    name: "MacBook Pro",
    sku: "MacBook Pro",
    category: "电脑",
    quantity: 20,
    threshold: 30,
    location: "上海",
    lastUpdated: "2024-03-10",
    price: 2000,
    status: "low_stock"
  },
  {
    id: "3",
    name: "AirPods Pro",
    sku: "AirPods Pro",
    category: "配件",
    quantity: 150,
    threshold: 100,
    location: "广州",
    lastUpdated: "2024-03-10",
    price: 500,
    status: "out_of_stock"
  }
];

export const mockAIInsights: AIInsight[] = [
  {
    id: "1",
    category: "inventory",
    title: "库存优化建议",
    summary: "iPhone 15 Pro 库存水平接近安全线",
    details: "根据销售趋势分析，iPhone 15 Pro 的需求持续增长，建议提高安全库存水平15%以应对即将到来的促销季。",
    timestamp: "2024-03-01 14:30:00",
  },
  {
    id: "2",
    category: "supply_chain",
    title: "供应链风险预警",
    summary: "检测到供应商延迟交付风险",
    details: "供应商C的近期交付时间出现异常延长，建议启动备选供应商方案或调整采购计划。",
    timestamp: "2024-03-01 15:45:00",
  },
  {
    id: "3",
    category: "efficiency",
    title: "效率提升机会",
    summary: "发现仓库布局优化机会",
    details: "通过分析作业流程，发现仓库一的布局可优化，预计可提升拣货效率20%。",
    timestamp: "2024-03-01 16:20:00",
  },
];

export const mockOverviewData = [
  { month: "1月", inbound: 1200, outbound: 1100 },
  { month: "2月", inbound: 1400, outbound: 1300 },
  { month: "3月", inbound: 1100, outbound: 1200 },
  { month: "4月", inbound: 1300, outbound: 1400 },
  { month: "5月", inbound: 1500, outbound: 1300 },
  { month: "6月", inbound: 1200, outbound: 1100 },
];

export const exceptionTypes = [
  {
    type: "inventory_mismatch",
    label: "库存不匹配",
    description: "实际库存与系统记录不符"
  },
  {
    type: "quality_issue",
    label: "质量问题",
    description: "产品质量不符合标准"
  },
  {
    type: "delivery_delay",
    label: "配送延迟",
    description: "订单配送超出预期时间"
  },
  {
    type: "wrong_product",
    label: "错误产品",
    description: "发货或收货的产品与订单不符"
  },
  {
    type: "damaged_goods",
    label: "货物损坏",
    description: "产品在运输或仓储过程中受损"
  }
];
