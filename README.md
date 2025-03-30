# MCP 智能订单管理与分析系统

一个现代化的订单管理系统，集成了AI分析功能，采用苹果设计风格的用户界面。

## 最新更新：顶部导航栏和用户设置

系统新增了固定的顶部导航栏，集成了用户信息、语言切换和深色/浅色模式切换功能，提升了用户体验。

## 最新更新：订单图片智能识别功能

系统新增了基于多模态AI的订单图片识别功能，可以通过上传订单或发票图片，自动提取关键信息并生成订单。

### 主要特点

- **固定顶部导航栏**：
  - 用户信息显示与快速访问菜单
  - 国际化语言切换（支持中文和英文）
  - 深色/浅色模式一键切换
  - 现代化UI设计，提升用户体验

- **订单图片智能识别**：
  - 支持上传、拍照和粘贴多种方式获取订单图片
  - 使用多模态AI模型自动识别订单关键信息
  - 支持识别商品明细、客户信息和付款条款等
  - 用户界面友好，可手动编辑识别结果
  - 支持一键创建订单，提高工作效率

- **多模型支持**：
  - OpenAI：GPT-4-turbo、GPT-4-vision、GPT-3.5-turbo等
  - Anthropic Claude：Claude-3-opus、Claude-3-sonnet、Claude-3-haiku等
  - 阿里云通义千问：千问turbo、千问plus、千问max等
  - 百度文心一言：ERNIE-Bot-4、ERNIE-Bot-turbo等
  - 支持自定义模型接入

- **灵活API配置**：
  - 自定义API密钥
  - 可配置自定义端点URL
  - 支持区域设置和代理配置

- **模型参数微调**：
  - 调整温度参数（Temperature）影响创造性
  - 配置上下文长度，适应不同场景需求
  - 开启/关闭多模态支持

- **故障转移机制**：
  - 设置默认模型
  - 当主模型不可用时自动切换到备选模型
  - 自动错误处理和重试策略

### 使用说明

1. **访问模型设置**：
   - 点击侧边栏的「系统设置」
   - 选择「模型设置」选项卡

2. **添加新模型**：
   - 点击「添加模型」按钮
   - 填写模型名称（自定义便于识别）
   - 选择模型提供商（OpenAI、Claude等）
   - 输入API密钥
   - 如有必要，配置自定义API端点URL
   - 选择具体的模型版本
   - 配置高级参数（上下文长度、温度等）

3. **设置默认模型**：
   - 在模型列表中选择一个模型
   - 开启「设为默认」选项
   - 系统将优先使用该模型进行分析

4. **启用多模态能力**：
   - 选择支持多模态的模型（如GPT-4-vision、Claude-3等）
   - 开启「多模态支持」选项
   - 系统将能够处理图像等多模态输入

5. **优化参数配置**：
   - 对于需要创造性回答的场景，提高温度值（0.7-1.0）
   - 对于需要精确分析的场景，降低温度值（0.1-0.5）
   - 根据需要调整上下文长度，平衡性能和成本

6. **模型管理**：
   - 可以随时启用或禁用特定模型
   - 删除不再使用的模型配置
   - 编辑现有模型的参数和设置

### 支持的端点格式

- **OpenAI**: https://api.openai.com/v1 (或自定义端点)
- **Anthropic**: https://api.anthropic.com
- **阿里云**: https://dashscope.aliyuncs.com/api/v1
- **百度**: https://aip.baidubce.com/rpc/2.0/ai_custom
- **硅基流动**: https://api.siliconflow.cn/v1/
- **自定义**: 可配置任意符合规范的端点

### 注意事项

- API密钥会安全地存储在您的系统中
- 建议配置至少两个不同提供商的模型，确保系统可用性
- 多模态功能需要选择支持该能力的模型
- 调整参数可能会影响API调用成本和系统响应时间

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

- ⚙️ AI模型设置
  - 多模型支持
    - OpenAI (GPT-4, GPT-3.5)
    - Anthropic Claude
    - 阿里云通义千问
    - 百度文心一言
    - 自定义模型
  - 灵活API配置
    - API密钥管理
    - 基础URL配置
    - 模型参数调整
  - 多模态支持
    - 图像分析能力
    - 文本处理能力

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
│   ├── predictions/       # AI预测分析页面
│   ├── knowledge/         # 知识库管理页面
│   └── settings/          # 系统设置页面
│       └── models/        # 模型管理页面
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

### AI模型配置
系统支持灵活配置不同的AI模型以适应不同场景：
1. 在系统设置中选择"模型设置"标签页
2. 可添加多种大模型API配置（OpenAI、Claude、通义千问等）
3. 设置模型参数（温度、上下文长度等）
4. 支持多模态分析功能的开启/关闭
5. 可设置默认模型与故障转移策略

### 硅基流动API接入指南

系统支持接入硅基流动API，并能自动加载可用模型列表，包括DeepSeek、Llama、Mistral等多种模型：

1. **配置硅基流动API**：
   - 在系统设置中，选择"模型设置"
   - 点击"添加模型"按钮
   - 在"模型提供商"下拉菜单中选择"硅基流动"
   - 在"模型名称"字段中输入便于识别的名称
   - 填写您的API密钥，格式为：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - API端点URL填写：`https://api.siliconflow.cn/v1/`

2. **测试API连接**：
   - 完成基本信息填写后，点击"测试API连接"按钮
   - 系统将验证API密钥的有效性
   - 连接成功后，系统会自动调用硅基流动的 `/models?type=text` API获取所有可用文本模型
   - 界面将显示"硅基流动API连接成功，找到 X 个可用模型"的提示

3. **查看可用模型列表**：
   - 成功连接后，点击"模型版本"下拉菜单
   - 所有可用的模型将按提供商分组展示，包括：
     - **DeepSeek**: deepseek系列模型
     - **Llama**: llama-3等系列模型
     - **Mistral**: mistral-7b、mixtral-8x7b等系列模型
     - **Yi**: yi-34b等系列模型
     - **Qwen**: 通义千问系列模型
     - **CodeLlama**: 代码专用模型
   - 所有模型旁边都会显示闪动的绿色指示点，表示模型实时可用状态

4. **选择并保存模型**：
   - 从列表中选择您需要的模型
   - 根据需要调整其他参数（上下文长度、温度等）
   - 可以设置为默认模型或启用/禁用此模型
   - 完成设置后，点击页面底部的"保存设置"按钮

5. **可能的API参数调整**：
   - 如果您希望获取更特定类型的模型，可以修改API端点URL
   - 例如，获取所有文本模型：`https://api.siliconflow.cn/v1/models?type=text`
   - 获取特定子类型的模型：`https://api.siliconflow.cn/v1/models?sub_type=chat`
   - 具体参数参考[硅基流动API文档](https://docs.siliconflow.cn/cn/api-reference/models/get-model-list)

通过以上步骤，您可以轻松连接硅基流动API，自动获取最新的可用模型列表（包括DeepSeek等各种模型），并直观地看到每个模型的可用状态。系统会根据不同的模型系列自动分类显示，方便您快速找到所需的模型。

## 更新日志

### v0.8.0
- 添加了订单图片智能识别功能
  - 支持通过上传、拍照或粘贴方式获取订单图片
  - 集成多模态AI模型自动识别订单关键信息
  - 实现了友好的用户界面，支持手动编辑识别结果
  - 添加了订单商品明细自动提取和计算功能
  - 支持一键创建订单，大幅提高工作效率

### v0.7.0
- 添加了固定顶部导航栏
  - 集成用户信息和快速访问菜单
  - 添加语言切换功能（支持中文和英文）
  - 整合深色/浅色模式切换按钮
  - 优化了整体界面布局，提升用户体验
  - 移除了侧边栏底部的用户信息区域，减少重复显示

### v0.6.0
- 添加了灵活的AI模型配置功能
  - 新增模型设置页面，支持多种大模型API配置
  - 增加对OpenAI、Claude、通义千问、文心一言等模型的支持
  - 添加对硅基流动API的完整支持：
    - 自动获取最新可用模型列表
    - 支持DeepSeek、Llama、Mistral等多种模型系列
    - 添加模型分组显示和实时状态指示功能
  - 添加多模态支持配置，可根据需求启用/禁用
  - 优化模型参数调整界面，提供友好的用户体验
  - 实现模型故障转移机制，提高系统稳定性

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
- [x] 添加灵活AI模型配置功能，支持多种大模型和多模态输入
- [x] 添加订单图片智能识别功能，支持图片上传和自动提取订单信息
- [ ] 添加高级搜索和过滤功能
- [ ] 实现多语言支持
- [ ] 添加用户角色和权限系统

## 功能模块

### 1. 订单管理

- 订单列表展示与筛选
- 订单详情查看
- 订单状态更新
- 异常订单标记

### 2. 智能分析

- 订单风险自动评估
- AI分析结果解释
- 风险等级可视化
- 推荐处理方案

### 3. 分析报告导出功能

分析报告导出功能允许用户将AI的分析结果导出为PDF格式，方便分享和存档。

**功能特点：**

- **PDF格式支持**：生成美观的PDF文档
- **包含思考过程**：展示AI分析的完整思维步骤
- **风险等级色彩标识**：不同风险使用不同颜色直观展示
- **推荐总结**：包含处理建议和风险提示
- **中文支持**：完美支持中文字符显示

**使用方法：**

1. 在订单列表中选择一个订单
2. 点击"分析"按钮获取AI分析结果
3. 在分析结果弹窗中点击"导出分析报告"
4. 系统会自动生成包含完整分析内容的PDF文件

### 4. 多模型配置

系统支持灵活配置不同的AI模型，满足不同场景的需求。

**功能特点：**

- **多模型支持**：支持接入OpenAI、Claude、智谱、文心一言等多种模型
- **参数自定义**：可配置温度、最大Token等关键参数
- **API密钥管理**：安全存储和管理各平台API密钥
- **模型负载均衡**：智能分配请求到不同模型，提高响应速度

**配置方法：**

1. 进入系统设置页面
2. 选择"模型设置"选项卡
3. 添加新模型或编辑现有模型配置
4. 设置模型参数和API密钥
5. 保存配置后即可在分析中使用

### 5. 知识库管理功能

知识库管理功能允许用户创建自定义知识库，并上传多种格式的文档，系统会自动处理并索引这些文档，以便用户能够通过AI进行智能问答交互。

#### 主要功能：

- **知识库创建与管理**：创建、编辑和删除自定义知识库，指定不同的embedding模型以满足不同的检索需求。
- **文档上传与处理**：支持上传PDF、Word、Excel、CSV、TXT、JSON和Markdown等多种格式的文档，系统会自动解析和索引内容。
- **智能问答交互**：基于知识库内容，用户可以通过AI进行自然语言问答，系统会从相关文档中检索信息并给出回答。
- **信息源引用**：AI回答问题时会引用相关文档作为信息来源，保证信息的可溯源性和准确性。
- **状态追踪**：实时显示知识库和文档的处理状态，包括索引进度等。

#### 如何使用：

1. **创建知识库**：点击"创建知识库"按钮，填写名称、描述，并选择适合的embedding模型。
2. **上传文档**：进入知识库详情页，点击"上传文档"按钮，可以通过拖放或选择文件的方式上传文档。
3. **等待处理**：上传完成后，系统会自动处理文档，包括文本提取、分块和向量化，这可能需要一些时间。
4. **开始问答**：处理完成后，点击"开始聊天"按钮，即可与知识库进行问答交互。
5. **查看来源**：AI回答问题时，可以点击"查看来源"查看信息的来源文档。

#### 技术实现：

- 使用嵌入模型（Embedding Models）将文档内容转换为向量表示，支持包括OpenAI、HuggingFace等提供商的多种模型。
- 采用向量数据库存储和检索文档内容，支持语义相似度搜索。
- 实现文档处理流水线，包括格式解析、文本提取、内容分块、向量化和索引等步骤。
- 使用大型语言模型（LLM）基于检索到的相关文档内容生成回答。 