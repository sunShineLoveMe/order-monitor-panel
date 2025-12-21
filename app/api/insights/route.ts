import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'insights' or 'overview'

  if (type === 'overview') {
    const { data, error } = await supabase
      .from('monthly_overview')
      .select('*')
      .order('month', { ascending: true });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
