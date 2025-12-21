-- Massive Data Seeding Script
-- Target: 100 Orders with realistic distributions
-- Created: 2025-12-21

DO $$
DECLARE
    i INTEGER;
    v_order_id UUID;
    v_exec_id UUID;
    v_cust_id UUID;
    v_prod_id UUID;
    v_status TEXT;
    v_type TEXT;
    v_date DATE;
    v_order_num TEXT;
    v_prod_name TEXT;
    v_prod_price DECIMAL;
    v_qty INTEGER;
    v_total DECIMAL;
    v_cust_name TEXT;
    v_exception_type TEXT;
    v_exception_desc TEXT;
BEGIN
    -- 1. Clear existing dynamic data (KEEP master data)
    DELETE FROM ai_analysis_results;
    DELETE FROM ai_analysis_steps;
    DELETE FROM ai_analysis_executions;
    DELETE FROM order_logs;
    DELETE FROM order_exceptions;
    DELETE FROM order_items;
    DELETE FROM orders;

    -- 2. Generate 100 orders
    FOR i IN 0..99 LOOP
        v_type := CASE WHEN i % 2 = 0 THEN 'inbound' ELSE 'outbound' END;
        
        -- Status distribution (15% Exception, 25% Pending, 25% Processing, 35% Completed)
        v_status := CASE 
            WHEN i < 15 THEN 'exception'
            WHEN i < 40 THEN 'pending'
            WHEN i < 65 THEN 'processing'
            ELSE 'completed'
        END;

        -- Pick a customer/supplier
        IF v_type = 'inbound' THEN
            SELECT id, name INTO v_cust_id, v_cust_name FROM customers WHERE type = 'supplier' ORDER BY (id::text || i::text) LIMIT 1;
        ELSE
            SELECT id, name INTO v_cust_id, v_cust_name FROM customers WHERE type = 'customer' ORDER BY (id::text || i::text) LIMIT 1;
        END IF;

        -- Pick a product
        SELECT id, name, price INTO v_prod_id, v_prod_name, v_prod_price FROM products ORDER BY (id::text || i::text) LIMIT 1;

        -- Date window
        v_date := CURRENT_DATE - (i % 90);
        v_order_num := CASE WHEN v_type = 'inbound' THEN 'IN-' ELSE 'OUT-' END || to_char(v_date, 'YYYYMMDD') || '-' || LPAD((i+1)::text, 3, '0');

        -- Special Case: MacBook Pro Anomaly (Index 0)
        IF i = 0 THEN
            v_order_num := 'IN-20241219-003';
            v_status := 'exception';
            v_date := '2024-12-19'::DATE;
            SELECT id, name INTO v_cust_id, v_cust_name FROM customers WHERE name = '小米通讯' LIMIT 1;
            SELECT id, name, price INTO v_prod_id, v_prod_name, v_prod_price FROM products WHERE name = 'MacBook Pro 14' LIMIT 1;
            v_qty := 123;
            v_total := 1598877.00;
        ELSE
            v_qty := floor(random() * 200 + 10)::int;
            v_total := v_prod_price * v_qty;
        END IF;

        -- Insert Order
        INSERT INTO orders (order_number, customer_id, customer_name, type, status, order_date, total_value, created_at)
        VALUES (v_order_num, v_cust_id, v_cust_name, v_type, v_status, v_date, v_total, v_date::timestamptz + interval '8 hours')
        RETURNING id INTO v_order_id;

        -- Insert Item
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time)
        VALUES (v_order_id, v_prod_id, v_prod_name, v_qty, v_prod_price);

        -- Build Diagnostics for Exception Orders
        IF v_status = 'exception' THEN
            IF i = 0 THEN
                v_exception_type := 'price_anomaly';
                v_exception_desc := '产品价格偏离历史均价超过 35%';
            ELSE
                v_exception_type := (ARRAY['inventory_mismatch', 'quality_issue', 'delivery_delay', 'wrong_product', 'damaged_goods', 'payment_issue', 'system_error', 'duplicate_order'])[1 + (i % 8)];
                v_exception_desc := 'Diagnostic check required for ' || v_exception_type;
            END IF;

            INSERT INTO order_exceptions (order_id, exception_type, description, status)
            VALUES (v_order_id, v_exception_type, v_exception_desc, 'open');

            INSERT INTO order_logs (order_id, log_level, service_name, message, context)
            VALUES (v_order_id, 'ERROR', 'SYSTEM_MONITOR', 'Exception triggered: ' || v_exception_type, jsonb_build_object('order', v_order_num));

            INSERT INTO ai_analysis_executions (order_id, status, started_at, finished_at)
            VALUES (v_order_id, 'completed', NOW(), NOW())
            RETURNING id INTO v_exec_id;

            IF i = 0 THEN
                INSERT INTO ai_analysis_steps (execution_id, step_order, title, status, icon_type, insight) VALUES
                (v_exec_id, 1, '收集订单基本信息...', 'completed', 'search', '订单号 ' || v_order_num),
                (v_exec_id, 2, '分析产品信息和数量...', 'completed', 'search', v_prod_name || ' x ' || v_qty),
                (v_exec_id, 3, '检查金额一致性...', 'completed', 'check', '警告：单价异常'),
                (v_exec_id, 4, '查找历史订单...', 'completed', 'search', '匹配到 5 笔历史记录'),
                (v_exec_id, 5, '识别异常模式...', 'completed', 'analyze', '供应商未曾供应过此类产品'),
                (v_exec_id, 6, '检测到订单异常点：产品价格偏离历史均价超过 35%', 'completed', 'check', '高风险标识');
            ELSE
                INSERT INTO ai_analysis_steps (execution_id, step_order, title, status, icon_type) VALUES
                (v_exec_id, 1, 'Auto-Diagnostic Initialized', 'completed', 'search'),
                (v_exec_id, 2, 'Risk Profile Generated', 'completed', 'analyze');
            END IF;
        END IF;
    END LOOP;
END $$;
