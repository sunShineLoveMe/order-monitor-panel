# MCP 智能订单管理与分析系统

一个现代化的订单管理系统，集成了AI分析功能，采用苹果设计风格的用户界面。

## 功能特点

- 📊 实时数据面板
  - 总库存量监控
  - 入库/出库数据统计
  - 异常订单追踪
  - AI驱动的库存分析

- 📦 订单管理
  - 入库订单处理
  - 出库订单处理
  - 订单状态追踪
  - 异常订单识别与处理

- 🤖 AI分析功能
  - 订单异常分析
    - 使用GPT-4模型进行深度分析
    - 自动生成分析报告
    - 提供解决方案建议
  - 库存优化建议
    - 智能库存水平预测
    - 补货时间建议
    - 周转率分析
  - 销售趋势分析
    - 产品需求预测
    - 季节性分析
    - 异常模式识别

- 🎨 现代化UI设计
  - 苹果风格界面
  - 响应式设计
  - 深色/浅色主题
  - 流畅动画效果

## 技术栈

- **前端框架**: Next.js 14
- **UI组件**: 
  - Radix UI
  - Tremor
  - Tailwind CSS
- **状态管理**: React Hooks
- **图表库**: Recharts
- **AI集成**: OpenAI GPT-4
- **类型系统**: TypeScript

## 开发环境设置

1. 克隆项目
```bash
git clone [repository-url]
cd order-monitor-panel
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
order-monitor-panel/
├── app/                    # Next.js 应用页面
│   ├── page.tsx           # 首页/数据面板
│   ├── inbound/           # 入库管理页面
│   ├── outbound/          # 出库管理页面
│   ├── inventory/         # 库存管理页面
│   ├── orders/            # 订单管理页面
│   └── predictions/       # AI预测分析页面
├── components/            # React组件
│   ├── ui/               # UI基础组件
│   ├── OrdersTable.tsx   # 订单表格组件
│   ├── InventoryTable.tsx # 库存表格组件
│   ├── AIPredictionCard.tsx # AI预测卡片
│   ├── SalesForecastChart.tsx # 销售预测图表
│   ├── SupplyChainRiskCard.tsx # 供应链风险卡片
│   └── InventoryOptimizationCard.tsx # 库存优化卡片
├── lib/                  # 工具函数和数据模型
│   ├── services/        # 服务层
│   │   ├── ai.ts       # AI服务
│   │   ├── database.ts # 数据库服务
│   │   └── dashboard.ts # 仪表盘服务
│   ├── data.ts         # 数据模型定义
│   └── utils.ts        # 工具函数
└── public/             # 静态资源
```

## AI分析功能使用说明

### 异常订单分析
系统使用GPT-4模型对异常订单进行深度分析，分析报告包含：
1. 异常类型识别
2. 根本原因分析
3. 解决方案建议
4. 预防措施推荐

### 库存优化分析
AI系统会持续监控库存状态，提供：
1. 库存水平预警
2. 补货时间建议
3. 周转率优化建议
4. 成本节约机会

## 更新日志

### v0.5.2
- 大幅增强了最近订单板块的功能和视觉效果
  - 改版为"实时订单流"，增加了自动滚动功能，提升科技感
  - 添加了订单详细信息显示，包括订单号、状态、产品和日期等
  - 集成AI智能分析，显示订单相关的处理时间、效率和风险评估
  - 添加了交互效果，鼠标悬停时显示AI分析洞察
  - 使用滚动指示器，直观展示当前查看的订单位置
  - 采用更现代的卡片式设计，提升整体UI质感

### v0.5.1
- 修复了AI洞察组件无法加载数据的问题
  - 增强了错误处理机制，确保在数据获取失败时仍能显示内容
  - 添加了多级数据回退策略：优先使用实时数据，失败时切换到模拟数据
  - 优化了AIService服务，增强数据验证和异常处理
  - 改进了组件UI，添加了加载状态和错误提示
  - 确保即使在网络异常或数据库连接问题时也能提供有用的AI洞察

### v0.5.0
- 增强了总览图表功能
  - 增加多维度数据展示：库存、销售额、利润等
  - 添加了数据过滤按钮，可以自由切换显示不同数据维度
  - 优化了Tooltip显示，自动转换销售额和利润显示格式
  - 确保图表数据丰富，覆盖最近6个月
  - 智能调整数据比例，使图表更加美观易读

### v0.4.0
- 全面增强首页仪表盘的AI预测功能
  - 添加了分页式仪表盘，包含总览、AI智能分析和库存管理三个标签页
  - 新增AI智能预测卡片，提供销售预测、库存预测和风险预警功能
  - 新增库存健康度热力图，直观展示不同仓库和产品的库存状态
  - 新增销售趋势预测图表，支持短期、中期和长期销售预测
  - 增加了AI智能决策支持模块，提供库存优化、供应链风险和价格策略建议
  - 优化了库存管理界面，提供更详细的库存健康指标和优化建议

### v0.3.0
- 增强了异常订单的自动处理能力
  - 自动检测异常订单
  - 基于规则的自动处理
  - 异常订单处理面板
  - 处理步骤追踪
  - 手动处理界面

### v0.2.0
- 增强了订单列表的AI分析功能
- 优化了数据面板的实时更新
- 添加了更多AI驱动的预测功能
  - 销售预测分析
  - 供应链风险预测
  - 库存优化建议

### v0.1.0
- 初始版本发布
- 基础订单管理功能
- AI分析集成
- 响应式界面设计

## 待办事项

- [x] 完善订单列表的AI分析功能
- [x] 优化数据面板的实时更新
- [x] 添加更多AI驱动的预测功能
- [x] 增强异常订单的自动处理能力
- [x] 增强首页仪表盘的AI预测功能和可视化展示
- [x] 增强总览图表功能，提供更丰富的数据维度和交互能力
- [x] 修复AI洞察组件数据加载问题
- [x] 改进最近订单板块，增加详细信息和动态效果
- [ ] 添加高级搜索和过滤功能
- [ ] 实现多语言支持
- [ ] 添加用户角色和权限系统 