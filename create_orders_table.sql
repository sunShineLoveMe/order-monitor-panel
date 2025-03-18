-- 创建orders表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    customer VARCHAR(100) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入模拟数据
INSERT INTO orders (order_number, customer, product_name, quantity, value, status, date, type) VALUES
-- 入库订单
('IN-2024-001', '苹果公司', 'iPhone 15 Pro', 100, 99999.00, 'completed', '2024-03-15 09:00:00+08', 'inbound'),
('IN-2024-002', '苹果公司', 'MacBook Pro 14', 50, 149999.00, 'completed', '2024-03-15 10:30:00+08', 'inbound'),
('IN-2024-003', '华为公司', 'Mate 60 Pro', 200, 6999.00, 'processing', '2024-03-15 14:20:00+08', 'inbound'),
('IN-2024-004', '小米公司', '小米14 Ultra', 150, 5999.00, 'pending', '2024-03-16 09:15:00+08', 'inbound'),
('IN-2024-005', 'OPPO公司', 'Find X7 Ultra', 120, 6999.00, 'completed', '2024-03-16 11:00:00+08', 'inbound'),
('IN-2024-006', 'vivo公司', 'X100 Pro', 180, 4999.00, 'processing', '2024-03-16 15:30:00+08', 'inbound'),
('IN-2024-007', '三星公司', 'Galaxy S24 Ultra', 100, 9999.00, 'completed', '2024-03-17 10:00:00+08', 'inbound'),
('IN-2024-008', '联想公司', 'ThinkPad X1', 80, 12999.00, 'pending', '2024-03-17 14:45:00+08', 'inbound'),
('IN-2024-009', '戴尔公司', 'XPS 15', 60, 15999.00, 'processing', '2024-03-18 09:30:00+08', 'inbound'),
('IN-2024-010', '华硕公司', 'ROG 游戏本', 40, 19999.00, 'completed', '2024-03-18 11:20:00+08', 'inbound'),
('IN-2024-011', '索尼公司', 'WH-1000XM5', 200, 2999.00, 'completed', '2024-03-18 15:00:00+08', 'inbound'),
('IN-2024-012', 'Bose公司', 'QuietComfort', 150, 2499.00, 'processing', '2024-03-19 10:15:00+08', 'inbound'),
('IN-2024-013', 'JBL公司', 'Flip 6', 300, 999.00, 'pending', '2024-03-19 14:30:00+08', 'inbound'),
('IN-2024-014', 'Beats公司', 'Studio Pro', 100, 2999.00, 'completed', '2024-03-20 09:45:00+08', 'inbound'),
('IN-2024-015', 'Sennheiser公司', 'Momentum 4', 80, 3499.00, 'processing', '2024-03-20 11:30:00+08', 'inbound'),
('IN-2024-016', 'Apple公司', 'AirPods Pro', 500, 1999.00, 'completed', '2024-03-20 15:15:00+08', 'inbound'),

-- 出库订单
('OUT-2024-001', '京东商城', 'iPhone 15 Pro', 50, 109999.00, 'completed', '2024-03-15 10:00:00+08', 'outbound'),
('OUT-2024-002', '天猫商城', 'MacBook Pro 14', 30, 159999.00, 'completed', '2024-03-15 11:30:00+08', 'outbound'),
('OUT-2024-003', '拼多多', 'Mate 60 Pro', 100, 7999.00, 'processing', '2024-03-15 15:20:00+08', 'outbound'),
('OUT-2024-004', '苏宁易购', '小米14 Ultra', 80, 6999.00, 'pending', '2024-03-16 10:15:00+08', 'outbound'),
('OUT-2024-005', '国美电器', 'Find X7 Ultra', 60, 7999.00, 'completed', '2024-03-16 12:00:00+08', 'outbound'),
('OUT-2024-006', '亚马逊中国', 'X100 Pro', 90, 5999.00, 'processing', '2024-03-16 16:30:00+08', 'outbound'),
('OUT-2024-007', '抖音商城', 'Galaxy S24 Ultra', 50, 10999.00, 'completed', '2024-03-17 11:00:00+08', 'outbound'),
('OUT-2024-008', '快手小店', 'ThinkPad X1', 40, 13999.00, 'pending', '2024-03-17 15:45:00+08', 'outbound'),
('OUT-2024-009', '小红书', 'XPS 15', 30, 16999.00, 'processing', '2024-03-18 10:30:00+08', 'outbound'),
('OUT-2024-010', '唯品会', 'ROG 游戏本', 20, 20999.00, 'completed', '2024-03-18 12:20:00+08', 'outbound'),
('OUT-2024-011', '网易严选', 'WH-1000XM5', 100, 3299.00, 'completed', '2024-03-18 16:00:00+08', 'outbound'),
('OUT-2024-012', '小米有品', 'QuietComfort', 80, 2699.00, 'processing', '2024-03-19 11:15:00+08', 'outbound'),
('OUT-2024-013', '华为商城', 'Flip 6', 150, 1099.00, 'pending', '2024-03-19 15:30:00+08', 'outbound'),
('OUT-2024-014', 'OPPO商城', 'Studio Pro', 50, 3199.00, 'completed', '2024-03-20 10:45:00+08', 'outbound'),
('OUT-2024-015', 'vivo商城', 'Momentum 4', 40, 3699.00, 'processing', '2024-03-20 12:30:00+08', 'outbound'),
('OUT-2024-016', '三星商城', 'AirPods Pro', 250, 2199.00, 'completed', '2024-03-20 16:15:00+08', 'outbound'); 