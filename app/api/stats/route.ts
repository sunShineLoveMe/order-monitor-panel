import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Fetch current month's totals and some aggregate stats
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('status, total_value');

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const { data: inventory, error: invError } = await supabase
    .from('inventory')
    .select('quantity, threshold');

  if (invError) {
    return NextResponse.json({ error: invError.message }, { status: 500 });
  }

  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    exceptionOrders: orders.filter(o => o.status === 'exception').length,
    lowStockItems: inventory.filter(i => i.quantity <= i.threshold).length,
    // Add more mock-compatible stats as needed
    monthlyGrowth: 15.8, // Constant for now or calculate from monthly_overview
    inventoryTurnover: 4.2
  };

  return NextResponse.json(stats);
}
