-- Full Schema and Seed Data Backup
-- Created: 2025-12-21

-- ==========================================
-- 1. SCHEMA DEFINITION
-- ==========================================

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    supplier TEXT,
    lead_time INTEGER,
    min_order_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('supplier', 'customer')) NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    type TEXT CHECK (type IN ('inbound', 'outbound')) NOT NULL,
    status TEXT CHECK (status IN ('completed', 'processing', 'pending', 'exception')) DEFAULT 'pending',
    order_date DATE DEFAULT CURRENT_DATE,
    total_value DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order exceptions table
CREATE TABLE IF NOT EXISTS order_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    exception_type TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER DEFAULT 10,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT CHECK (category IN ('inventory', 'sales', 'supply_chain', 'efficiency', 'anomaly')) NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Overview table
CREATE TABLE IF NOT EXISTS monthly_overview (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    inbound INTEGER DEFAULT 0,
    outbound INTEGER DEFAULT 0,
    revenue DECIMAL(15, 2) DEFAULT 0,
    profit DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order logs table
CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    log_level TEXT CHECK (log_level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')) DEFAULT 'INFO',
    service_name TEXT,
    message TEXT NOT NULL,
    context JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Executions
CREATE TABLE IF NOT EXISTS ai_analysis_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    trigger_type TEXT DEFAULT 'manual',
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    execution_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Steps
CREATE TABLE IF NOT EXISTS ai_analysis_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES ai_analysis_executions(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'active')) DEFAULT 'pending',
    icon_type TEXT,
    insight TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Results
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES ai_analysis_executions(id) ON DELETE CASCADE,
    root_cause TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    solutions JSONB,
    recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. SEED DATA
-- ==========================================

-- Seed Warehouses
INSERT INTO warehouses (name, location) VALUES
('北京一号仓', '北京'),
('上海二号仓', '上海'),
('深圳三号仓', '深圳'),
('广州四号仓', '广州'),
('成都五号仓', '成都'),
('杭州六号仓', '杭州'),
('武汉七号仓', '武汉'),
('西安八号仓', '西安');

-- Seed Customers & Suppliers
INSERT INTO customers (name, type, email) VALUES
('苹果公司', 'supplier', 'support@apple.com'),
('华为技术有限公司', 'supplier', 'contact@huawei.com'),
('小米通讯', 'supplier', 'info@mi.com'),
('索尼(中国)', 'supplier', 'sony@sony.cn'),
('三星电子', 'supplier', 'samsung@samsung.com'),
('京东方', 'supplier', 'boe@boe.com'),
('京东自营', 'customer', 'jd@jd.com'),
('天猫旗舰店', 'customer', 'tmall@tmall.com'),
('顺丰速运', 'customer', 'sf@sf.com'),
('苏宁易购', 'customer', 'suning@suning.com');

-- Seed Products
INSERT INTO products (name, sku, category, price, supplier) VALUES
('iPhone 15 Pro', 'IP15P-BLK-128', '手机', 7999.00, '苹果公司'),
('iPhone 15 Pro Max', 'IP15PM-NAT-256', '手机', 9999.00, '苹果公司'),
('MacBook Pro 14', 'MBP14-M3-16', '电脑', 12999.00, '苹果公司'),
('Mate 60 Pro', 'HWM60P-GRN-512', '手机', 6999.00, '华为技术有限公司'),
('小米14 Ultra', 'MI14U-WHT-512', '手机', 6499.00, '小米通讯'),
('PS5 光驱版', 'SONY-PS5-DISK', '游戏设备', 3499.00, '索尼(中国)'),
('AirPods Pro 2', 'APP2-USBC', '配件', 1899.00, '苹果公司'),
('Sony A7M4', 'SONY-A7M4-BODY', '摄像', 16999.00, '索尼(中国)'),
('Dell XPS 13', 'DELL-XPS13-9315', '电脑', 8999.00, '戴尔中国'),
('ThinkPad X1', 'TP-X1C-G11', '电脑', 9999.00, '联想集团');

-- Helper variable for specific order seeding
DO $$
DECLARE
    xiaomi_id UUID;
    macbook_id UUID;
    order_id UUID;
    execution_id UUID;
BEGIN
    SELECT id INTO xiaomi_id FROM customers WHERE name = '小米通讯' LIMIT 1;
    SELECT id INTO macbook_id FROM products WHERE name = 'MacBook Pro 14' LIMIT 1;

    -- Specific exception order
    INSERT INTO orders (order_number, customer_id, customer_name, type, status, order_date, total_value)
    VALUES ('IN-20241219-003', xiaomi_id, '小米通讯', 'inbound', 'exception', '2024-12-19', 1598877.00)
    RETURNING id INTO order_id;

    INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time)
    VALUES (order_id, macbook_id, 'MacBook Pro 14', 123, 12999.00);

    INSERT INTO order_exceptions (order_id, exception_type, description, status)
    VALUES (order_id, 'price_anomaly', '产品价格偏离历史均价超过 35%', 'open');

    INSERT INTO order_logs (order_id, log_level, service_name, message, context)
    VALUES (order_id, 'ERROR', 'PRICING_SERVICE', 'Anomaly detected: Order price (1,598,877) significantly differs from historical average for MacBook Pro 14.',
    '{"historical_avg": 1180000, "deviation_percent": 35.5, "product_id": "d04d688b-cdcc-4455-a25f-43e727fc86be"}'::jsonb);

    -- Analysis Execution
    INSERT INTO ai_analysis_executions (order_id, status, execution_data)
    VALUES (order_id, 'completed', '{"workflow_id": "n8n_order_forensics_v1", "execution_id": "987654321"}')
    RETURNING id INTO execution_id;

    -- Analysis Steps
    INSERT INTO ai_analysis_steps (execution_id, step_order, title, status, icon_type, insight) VALUES
    (execution_id, 1, '收集订单基本信息...', 'completed', 'search', '订单号 IN-20241219-003, 金额 ¥1,598,877'),
    (execution_id, 2, '分析订单 IN-20241219-003 的产品信息和数量...', 'completed', 'search', '产品: MacBook Pro 14, 数量: 123'),
    (execution_id, 3, '检查订单金额 ¥1,598,877 是否与市场价格一致...', 'completed', 'check', '警告：单价 ¥12,999 与历史采购均价偏差较大'),
    (execution_id, 4, '查找相关历史订单数据...', 'completed', 'search', '近3个月该供应商同型号订单 5 笔'),
    (execution_id, 5, '发现客户 "小米通讯" 的历史订单模式...', 'completed', 'analyze', '该客户此前从未供应过 Apple 产品'),
    (execution_id, 6, '检测到订单异常点：产品价格偏离历史均价超过 35%', 'completed', 'check', '高风险标识');

    -- Analysis Result
    INSERT INTO ai_analysis_results (execution_id, root_cause, risk_level, solutions)
    VALUES (execution_id, 'Data entry error or potential fraudulent invoice. Price is 35% higher than historical average.', 'high',
    '[{"title": "Verify with Supplier", "action": "Contact Xiaomi sales representative to confirm quote validity."}, {"title": "Check Logistics", "action": "Inspect if goods have physically arrived and match SKU."}]'::jsonb);
END $$;

-- Other random sample orders
INSERT INTO orders (order_number, type, status, order_date, total_value) VALUES
('OUT-20241221-001', 'outbound', 'completed', '2024-12-21', 450000.00),
('IN-20241220-002', 'inbound', 'processing', '2024-12-20', 890000.00),
('OUT-20241218-004', 'outbound', 'exception', '2024-12-18', 120000.00);

-- Inventory seeding
INSERT INTO inventory (product_id, warehouse_id, quantity, threshold)
SELECT p.id, w.id, floor(random() * 500 + 50)::int, 100
FROM products p, warehouses w
LIMIT 20;

-- AI Insights
INSERT INTO ai_insights (category, title, summary, details, timestamp) VALUES
('inventory', '高价值库存预警', 'MacBook Pro 系列库存周转放缓', '最近30天内，16英寸型号周转率下降了12%，建议调整采购策略。', NOW()),
('anomaly', '订单价格异常预警', '检测到多个入库订单价格超过历史均值', '特别是针对电子产品类目，系统发现供应商报价波动较大，请核实。', NOW());

-- Monthly Overview
INSERT INTO monthly_overview (month, inbound, outbound, revenue, profit) VALUES
('2024-10', 1400, 1320, 820000, 195000),
('2024-11', 2100, 1950, 1250000, 310000),
('2024-12', 1800, 1720, 1050000, 245000);
