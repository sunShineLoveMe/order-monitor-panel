-- 插入产品数据
INSERT INTO products (name, category, price, cost) VALUES
('智能手机 Pro', '电子产品', 5999.00, 3500.00),
('超薄笔记本电脑', '电子产品', 8999.00, 5200.00),
('无线耳机', '电子产品', 999.00, 350.00),
('智能手表', '电子产品', 1999.00, 800.00),
('4K高清电视', '电子产品', 4999.00, 2800.00),
('智能音箱', '电子产品', 699.00, 300.00),
('游戏主机', '电子产品', 3999.00, 2200.00),
('数码相机', '电子产品', 4599.00, 2500.00),
('平板电脑', '电子产品', 3299.00, 1800.00),
('智能路由器', '电子产品', 399.00, 180.00),
('办公桌', '家具', 1299.00, 650.00),
('人体工学椅', '家具', 999.00, 450.00),
('书架', '家具', 599.00, 280.00),
('床垫', '家具', 2999.00, 1500.00),
('沙发', '家具', 5999.00, 3000.00),
('餐桌', '家具', 1999.00, 900.00),
('衣柜', '家具', 2499.00, 1200.00),
('茶几', '家具', 899.00, 400.00),
('床头柜', '家具', 599.00, 250.00),
('鞋柜', '家具', 799.00, 350.00);

-- 插入库存数据
INSERT INTO inventory (product_id, current_stock, min_stock_level, max_stock_level, location)
SELECT 
  id, 
  FLOOR(RANDOM() * 100) + 10, -- 当前库存10-110
  FLOOR(RANDOM() * 20) + 5,   -- 最小库存5-25
  FLOOR(RANDOM() * 50) + 100, -- 最大库存100-150
  CASE 
    WHEN RANDOM() < 0.3 THEN '北京仓库'
    WHEN RANDOM() < 0.6 THEN '上海仓库'
    ELSE '广州仓库'
  END
FROM products;

-- 插入供应商数据
INSERT INTO suppliers (name, contact_person, email, phone, address, reliability_score) VALUES
('科技电子有限公司', '张三', 'zhangsan@keji.com', '13800138001', '深圳市南山区科技园', 0.95),
('全球电子科技', '李四', 'lisi@global.com', '13900139002', '上海市浦东新区张江高科技园区', 0.88),
('优质家具制造商', '王五', 'wangwu@furniture.com', '13700137003', '广州市番禺区家具产业园', 0.92),
('创新科技有限公司', '赵六', 'zhaoliu@innovation.com', '13600136004', '北京市海淀区中关村', 0.85),
('精品家居集团', '钱七', 'qianqi@home.com', '13500135005', '杭州市西湖区文创园', 0.90),
('东方电子科技', '孙八', 'sunba@eastern.com', '13400134006', '南京市江宁区科技园', 0.82),
('未来科技有限公司', '周九', 'zhoujiu@future.com', '13300133007', '成都市高新区', 0.87),
('品质家具有限公司', '吴十', 'wushi@quality.com', '13200132008', '东莞市家具产业园', 0.93);

-- 建立供应链关系
INSERT INTO supply_chain (product_id, supplier_id, lead_time, min_order_quantity, price_per_unit)
SELECT 
  p.id,
  s.id,
  FLOOR(RANDOM() * 20) + 5, -- 交货时间5-25天
  FLOOR(RANDOM() * 50) + 10, -- 最小订购量10-60
  p.cost * (0.8 + RANDOM() * 0.1) -- 供应价格为成本的80%-90%
FROM products p
CROSS JOIN suppliers s
WHERE 
  (p.category = '电子产品' AND s.name LIKE '%电子%') OR
  (p.category = '家具' AND s.name LIKE '%家具%' OR s.name LIKE '%家居%')
LIMIT 40; -- 限制关系数量

-- 插入历史销售数据 (过去90天)
INSERT INTO sales (product_id, quantity, unit_price, total_price, sale_date)
SELECT 
  p.id,
  FLOOR(RANDOM() * 10) + 1, -- 销售数量1-10
  p.price,
  (FLOOR(RANDOM() * 10) + 1) * p.price,
  NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 90)) -- 过去90天内的随机日期
FROM products p
CROSS JOIN generate_series(1, 20) -- 每个产品生成20条销售记录
ORDER BY RANDOM()
LIMIT 1000; -- 总共1000条销售记录

-- 插入一些供应链风险事件
INSERT INTO supply_chain_risks (supplier_id, risk_type, severity, description, start_date, expected_resolution_date, is_resolved)
VALUES
((SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1), 'delay', 'medium', '由于运输问题，预计交货将延迟7-10天', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', FALSE),
((SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1), 'shortage', 'high', '关键原材料短缺，影响多个产品生产', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', FALSE),
((SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1), 'price_increase', 'low', '原材料成本上涨5%，可能影响未来订单定价', NOW() - INTERVAL '15 days', NULL, FALSE),
((SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1), 'quality', 'critical', '最近批次产品存在质量问题，需要全面检查', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days', FALSE),
((SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1), 'delay', 'low', '轻微的物流延误，预计影响不大', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days', TRUE);

-- 插入AI预测结果
INSERT INTO predictions (prediction_type, data, confidence, created_at, expires_at)
VALUES
('sales', '{
  "trends": [
    {
      "direction": "up",
      "percentage": 12.5,
      "description": "预计未来30天销售额将增长12.5%，主要由电子产品类别驱动"
    }
  ],
  "overallConfidence": 0.85,
  "topProducts": ["智能手机 Pro", "超薄笔记本电脑", "无线耳机"],
  "insights": "节假日促销活动预计将带动销售额显著提升"
}', 0.85, NOW(), NOW() + INTERVAL '1 day'),

('inventory', '{
  "products": [
    {
      "productId": "智能手机 Pro的ID",
      "productName": "智能手机 Pro",
      "currentStock": 25,
      "predictedDemand": 40,
      "riskLevel": "high",
      "recommendation": "建议立即补货15台以上"
    },
    {
      "productId": "无线耳机的ID",
      "productName": "无线耳机",
      "currentStock": 50,
      "predictedDemand": 35,
      "riskLevel": "low",
      "recommendation": "库存充足，无需补货"
    },
    {
      "productId": "智能手表的ID",
      "productName": "智能手表",
      "currentStock": 15,
      "predictedDemand": 20,
      "riskLevel": "medium",
      "recommendation": "建议适量补货"
    }
  ]
}', 0.78, NOW(), NOW() + INTERVAL '1 day'),

('supply_chain', '{
  "riskLevel": "medium",
  "timeToImpact": "14天",
  "affectedProducts": ["智能手机 Pro", "超薄笔记本电脑"],
  "riskFactors": [
    {
      "factor": "原材料短缺",
      "severity": "medium",
      "mitigation": "寻找替代供应商"
    },
    {
      "factor": "物流延误",
      "severity": "low",
      "mitigation": "调整配送路线"
    }
  ]
}', 0.72, NOW(), NOW() + INTERVAL '1 day'); 