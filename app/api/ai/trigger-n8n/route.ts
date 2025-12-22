// Version: 1.0.1 - n8n integration
import { NextResponse } from 'next/server';

// 临时硬编码 n8n Webhook URL（用于绕过 Vercel 环境变量问题）
// TODO: 调试完成后改回使用环境变量
const N8N_WEBHOOK_URL = 'http://54.252.239.164:5678/webhook-test/order-analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const n8nWebhookUrl = N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return NextResponse.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 });
    }

    console.log(`[Proxy] Triggering n8n: ${n8nWebhookUrl}`);

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
