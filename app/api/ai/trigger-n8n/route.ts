// Version: 1.0.2 - n8n integration with env var support
import { NextResponse } from 'next/server';

// 优先从环境变量获取 n8n Webhook URL
// 使用服务端代理以规避浏览器 Mixed Content (HTTPS -> HTTP) 限制并增强安全性
const getUrl = () => {
  const envUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (envUrl) return envUrl;
  
  // 备用硬编码 URL（仅作为最后手段）
  return 'http://54.252.239.164:5678/webhook/order-analysis';
};

const N8N_WEBHOOK_URL = getUrl();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const n8nWebhookUrl = N8N_WEBHOOK_URL;

    console.log(`[Proxy] Triggering n8n at: ${n8nWebhookUrl.substring(0, 60)}...`);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] n8n responded with error: ${response.status}`, errorText);
      return NextResponse.json({ error: 'n8n error', details: errorText }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Proxy] Failed to proxy to n8n:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
