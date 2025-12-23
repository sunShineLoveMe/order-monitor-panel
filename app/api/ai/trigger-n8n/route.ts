// Version: 1.0.2 - n8n integration with env var support
import { NextResponse } from 'next/server';

// 优先从环境变量获取 n8n Webhook URL
// 使用服务端代理以规避浏览器 Mixed Content (HTTPS -> HTTP) 限制并增强安全性
const getUrl = () => {
  let envUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  // 智能纠错：如果用户从浏览器复制了 n8n 编辑器地址 (包含 /workflow/)，自动警告并替换为 webhook 路径
  if (envUrl && envUrl.includes('/workflow/')) {
    console.warn('[Proxy] 警告: 检测到配置的是 n8n 工作流编辑器地址 (UI URL)，而非 Webhook URL。');
    console.warn('[Proxy] 正在尝试自动修正为 Webhook 路径...');
    // 假设用户只是把 path 搞错了，保留 host
    try {
      const urlObj = new URL(envUrl);
      envUrl = `${urlObj.protocol}//${urlObj.host}/webhook/order-analysis`;
      console.warn(`[Proxy] 已自动修正为: ${envUrl}`);
    } catch (e) {
      console.error('[Proxy] URL 解析失败，无法自动修正');
    }
  }

  if (envUrl) return envUrl;
  
  // 备用硬编码 URL（仅作为最后手段）
  // 确保这里也是 /webhook/ 而不是 /workflow/
  return 'http://54.252.239.164:5678/webhook/order-analysis';
};

const N8N_WEBHOOK_URL = getUrl();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const n8nWebhookUrl = N8N_WEBHOOK_URL;

    console.log(`[Proxy] 收到触发请求. 目标 URL: ${n8nWebhookUrl}`);
    
    // 记录请求体关键信息（不包含敏感数据）
    console.log(`[Proxy] 数据负载: order_id=${body.order_id}, execution_id=${body.execution_id}`);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`[Proxy] n8n 响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] n8n 返回错误: ${response.status}`, errorText);
      return NextResponse.json({ 
        error: 'n8n_error', 
        status: response.status,
        details: errorText.substring(0, 200) 
      }, { status: response.status });
    }

    const responseData = await response.text();
    console.log(`[Proxy] n8n 触发成功:`, responseData.substring(0, 100));

    return NextResponse.json({ success: true, message: 'Triggered successfully' });
  } catch (error: any) {
    console.error('[Proxy] 转发请求到 n8n 失败:', error);
    
    // 检查是否是由于 HTTPS/HTTP 引起的问题（虽然在服务器端不应该发生 Mixed Content）
    const isProtocolError = error.message?.includes('protocol') || error.message?.includes('SSL');
    
    return NextResponse.json({ 
      error: 'proxy_failed', 
      message: error.message,
      isProtocolError,
      targetUrl: N8N_WEBHOOK_URL.substring(0, 30) + '...'
    }, { status: 500 });
  }
}
