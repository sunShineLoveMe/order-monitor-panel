import type { Order as OrderType } from './types';

export type { OrderType as Order };

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

export const mockOrders: OrderType[] = Array.from({ length: 100 }).map((_, i) => {
  const id = (i + 1).toString();
  const type = i % 2 === 0 ? "inbound" : "outbound";
  const statusOptions: OrderType['status'][] = ["completed", "processing", "pending", "exception"];
  
  // 15% exception rate as planned
  let status: OrderType['status'];
  if (i < 15) {
    status = "exception";
  } else if (i < 40) {
    status = "pending";
  } else if (i < 65) {
    status = "processing";
  } else {
    status = "completed";
  }

  const suppliers = ["苹果公司", "华为技术有限公司", "小米通讯", "索尼(中国)", "三星电子", "阿里巴巴", "腾讯科技", "联想集团", "戴尔中国", "惠普中国"];
  const customers = ["京东自营", "天猫旗舰店", "拼多多官方店", "苏宁易购", "顺丰速运", "美团配送", "唯品会", "盒马鲜生", "抖音小店", "快手电商"];
  const products = [
    { name: "iPhone 15 Pro", price: 7999, category: "手机" },
    { name: "iPhone 15 Pro Max", price: 9999, category: "手机" },
    { name: "MacBook Pro 14", price: 12999, category: "电脑" },
    { name: "MacBook Pro 16", price: 19999, category: "电脑" },
    { name: "AirPods Pro 2", price: 1899, category: "配件" },
    { name: "Apple Watch S9", price: 2999, category: "配件" },
    { name: "Mate 60 Pro", price: 6999, category: "手机" },
    { name: "Mate 60 Pro+", price: 8999, category: "手机" },
    { name: "MatePad Pro", price: 4299, category: "平板" },
    { name: "小米14 Ultra", price: 6499, category: "手机" },
    { name: "小米手环 8", price: 249, category: "配件" },
    { name: "PS5", price: 3499, category: "游戏设备" },
    { name: "Sony A7M4", price: 16999, category: "摄像" },
    { name: "ThinkPad X1", price: 9999, category: "电脑" },
    { name: "Dell XPS 13", price: 8999, category: "电脑" }
  ];

  const product = products[i % products.length];
  const customer = type === "inbound" ? suppliers[i % suppliers.length] : customers[i % customers.length];
  const quantity = Math.floor(Math.random() * 200) + 10;
  const value = product.price * quantity;
  
  // Date calculation: spread over last 90 days
  const date = new Date();
  date.setDate(date.getDate() - (i % 90));
  const dateStr = date.toISOString();

  const order: OrderType = {
    id,
    order_number: `${type === "inbound" ? "IN" : "OUT"}-2024${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${id.padStart(3, '0')}`,
    customer,
    type,
    status,
    product_name: product.name,
    quantity,
    value,
    date: dateStr.split('T')[0],
    created_at: dateStr,
    updated_at: dateStr,
  };

  if (status === "exception") {
    const eTypes = [
      { type: "inventory_mismatch", desc: "实际库存与系统记录不符，盘点偏差" },
      { type: "quality_issue", desc: "抽检发现产品外壳有划痕，不符合出库标准" },
      { type: "delivery_delay", desc: "受天气影响，干线物流延迟预计超过24小时" },
      { type: "wrong_product", desc: "SKU标签贴错，导致发货型号与订单不一致" },
      { type: "damaged_goods", desc: "卸货过程中发生碰撞，包装箱严重变形" },
      { type: "payment_issue", desc: "支付网关返回异常码，资金结算未到账" },
      { type: "system_error", desc: "API同步超时，订单状态在库存中心未更新" },
      { type: "duplicate_order", desc: "检测到与其ID为E" + (i+100) + "的订单完全重复" }
    ];
    const e = eTypes[i % eTypes.length];
    order.exceptions = [{
      type: e.type,
      description: e.desc,
      status: "open",
      created_at: dateStr
    }];
  }

  return order;
});

export const mockInventoryData: InventoryItem[] = [
  { id: "1", name: "iPhone 15 Pro", sku: "IP15P-BLK-128", category: "手机", quantity: 450, threshold: 100, location: "北京一号仓", price: 7999, status: "in_stock", lastUpdated: "2024-03-20", supplier: "苹果公司" },
  { id: "2", name: "iPhone 15 Pro Max", sku: "IP15PM-NAT-256", category: "手机", quantity: 85, threshold: 100, location: "北京一号仓", price: 9999, status: "low_stock", lastUpdated: "2024-03-21", supplier: "苹果公司" },
  { id: "3", name: "MacBook Pro 14", sku: "MBP14-M3-16", category: "电脑", quantity: 0, threshold: 20, location: "上海二号仓", price: 12999, status: "out_of_stock", lastUpdated: "2024-03-19", supplier: "苹果公司" },
  { id: "4", name: "Mate 60 Pro", sku: "HWM60P-GRN-512", category: "手机", quantity: 320, threshold: 50, location: "深圳三号仓", price: 6999, status: "in_stock", lastUpdated: "2024-03-21", supplier: "华为技术有限公司" },
  { id: "5", name: "小米14 Ultra", sku: "MI14U-WHT-512", category: "手机", quantity: 150, threshold: 40, location: "北京一号仓", price: 6499, status: "in_stock", lastUpdated: "2024-03-18", supplier: "小米通讯" },
  { id: "6", name: "PS5 光驱版", sku: "SONY-PS5-DISK", category: "游戏设备", quantity: 12, threshold: 15, location: "广州四号仓", price: 3499, status: "low_stock", lastUpdated: "2024-03-20", supplier: "索尼(中国)" },
  { id: "7", name: "AirPods Pro 2", sku: "APP2-USBC", category: "配件", quantity: 1200, threshold: 200, location: "上海二号仓", price: 1899, status: "in_stock", lastUpdated: "2024-03-21", supplier: "苹果公司" },
  { id: "8", name: "Sony A7M4", sku: "SONY-A7M4-BODY", category: "摄像", quantity: 25, threshold: 10, location: "成都五号仓", price: 16999, status: "in_stock", lastUpdated: "2024-03-17", supplier: "索尼(中国)" },
  { id: "9", name: "Dell XPS 13", sku: "DELL-XPS13-9315", category: "电脑", quantity: 45, threshold: 15, location: "杭州六号仓", price: 8999, status: "in_stock", lastUpdated: "2024-03-19", supplier: "戴尔中国" },
  { id: "10", name: "ThinkPad X1", sku: "TP-X1C-G11", category: "电脑", quantity: 5, threshold: 10, location: "广州四号仓", price: 9999, status: "low_stock", lastUpdated: "2024-03-21", supplier: "联想集团" },
  // ... 添加更多库存项直到30条
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: (i + 11).toString(),
    name: `备件-${i + 1}`,
    sku: `PART-${1000 + i}`,
    category: "配件",
    quantity: Math.floor(Math.random() * 100),
    threshold: 20,
    location: ["北京", "上海", "广州", "深圳", "武汉", "成都", "杭州"][i % 7] + "仓库",
    price: Math.floor(Math.random() * 1000) + 100,
    status: Math.random() > 0.2 ? "in_stock" : "low_stock",
    lastUpdated: "2024-03-21",
    supplier: "通用供应商"
  })) as InventoryItem[]
];

export const mockAIInsights: AIInsight[] = [
  { id: "1", category: "inventory", title: "高价值库存预警", summary: "MacBook Pro 系列库存周转放缓", details: "最近30天内，16英寸型号周转率下降了12%，建议调整采购策略或启动针对性的促销活动以减少资金占用。", timestamp: "2024-03-21 10:00:00" },
  { id: "2", category: "sales", title: "需求预测上涨", summary: "iPhone 15 需求在华东区攀升", details: "基于历史数据和社交媒体趋势分析，预计上海仓库下周需求将增长25%，请提前安排补货。", timestamp: "2024-03-21 11:30:00" },
  { id: "3", category: "supply_chain", title: "供应商交付表现", summary: "供应商C的交付准时率下降", details: "连续三次入库单出现平均2.5天的延迟，可能影响到下月的出库计划。建议与负责人沟通其物流链问题。", timestamp: "2024-03-21 14:15:00" },
  { id: "4", category: "efficiency", title: "仓库作业优化", summary: "北京仓库分拣路径冗余", details: "AI分析建议将热门爆款（手机类）移动至靠近打包区的A1-B3货架，预计可缩短分拣时间15%。", timestamp: "2024-03-21 16:45:00" },
  { id: "5", category: "anomaly", title: "异常模式识别", summary: "检测到批量退货风险", details: "OUT-20240320批次订单在某平台出现多起关于包装质量的负面反馈，请查验物流环节是否变动。", timestamp: "2024-03-21 09:20:00" },
  { id: "6", category: "inventory", title: "库存健康度分析", summary: "仓库容量利用率达到85%", details: "深圳仓库目前处于高负载状态，这会降低作业效率。建议优先处理积压超过90天的呆滞料。", timestamp: "2024-03-20 15:30:00" },
  { id: "7", category: "sales", title: "利润空间提示", summary: "配件类利润贡献率提升", details: "AirPods 系列本周毛利率上涨了3%，主要由直销渠道放量带动。可考虑在其他平台跟进推广。", timestamp: "2024-03-20 18:20:00" },
  ...Array.from({ length: 13 }).map((_, i) => ({
    id: (i + 8).toString(),
    category: ["inventory", "sales", "supply_chain", "efficiency", "anomaly"][i % 5] as any,
    title: `智能自动化提示 ${i + 1}`,
    summary: `分析洞察摘要 ${i + 1}`,
    details: `这是通过AI大规模分析生产环境数据后得出的详细改进方案或风险提示 ${i + 1}。`,
    timestamp: "2024-03-20 12:00:00"
  }))
];

export const mockOverviewData = [
  { month: "2023-04", inbound: 850, outbound: 780, revenue: 450000, profit: 90000 },
  { month: "2023-05", inbound: 920, outbound: 860, revenue: 510000, profit: 110000 },
  { month: "2023-06", inbound: 1100, outbound: 1050, revenue: 620000, profit: 145000 },
  { month: "2023-07", inbound: 980, outbound: 940, revenue: 540000, profit: 115000 },
  { month: "2023-08", inbound: 1050, outbound: 1020, revenue: 580000, profit: 128000 },
  { month: "2023-09", inbound: 1250, outbound: 1180, revenue: 710000, profit: 165000 },
  { month: "2023-10", inbound: 1400, outbound: 1320, revenue: 820000, profit: 195000 },
  { month: "2023-11", inbound: 2100, outbound: 1950, revenue: 1250000, profit: 310000 },
  { month: "2023-12", inbound: 1800, outbound: 1720, revenue: 1050000, profit: 245000 },
  { month: "2024-01", inbound: 1200, outbound: 1150, revenue: 730000, profit: 155000 },
  { month: "2024-02", inbound: 950, outbound: 890, revenue: 560000, profit: 105000 },
  { month: "2024-03", inbound: 1100, outbound: 1200, revenue: 680000, profit: 140000 },
];

export const exceptionTypes = [
  { type: "inventory_mismatch", label: "库存不匹配", description: "实际库存与系统记录不符" },
  { type: "quality_issue", label: "质量问题", description: "产品质量不符合标准" },
  { type: "delivery_delay", label: "配送延迟", description: "订单配送超出预期时间" },
  { type: "wrong_product", label: "错误产品", description: "发货或收货的产品与订单不符" },
  { type: "damaged_goods", label: "货物损坏", description: "产品在运输或仓储过程中受损" },
  { type: "payment_issue", label: "支付异常", description: "订单支付流程存在异常" },
  { type: "system_error", label: "系统错误", description: "系统同步或逻辑执行异常" },
  { type: "duplicate_order", label: "重复订单", description: "检测到重复提交的订单" }
];
