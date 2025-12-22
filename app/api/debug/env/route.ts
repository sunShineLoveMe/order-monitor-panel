import { NextResponse } from 'next/server';

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER DEBUGGING
export async function GET() {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  const n8nPublicUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  return NextResponse.json({
    hasN8N_WEBHOOK_URL: !!n8nUrl,
    hasNEXT_PUBLIC_N8N_WEBHOOK_URL: !!n8nPublicUrl,
    // Show first 30 chars for verification (hide most of the URL for security)
    n8nUrlPreview: n8nUrl ? n8nUrl.substring(0, 30) + '...' : null,
    n8nPublicUrlPreview: n8nPublicUrl ? n8nPublicUrl.substring(0, 30) + '...' : null,
  });
}
