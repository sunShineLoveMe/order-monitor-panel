import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name, sku, category, price, supplier)')
    .order('last_updated', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the response to match frontend expectations
  const flattenedData = data.map((item: any) => ({
    id: item.id,
    name: item.products.name,
    sku: item.products.sku,
    category: item.products.category,
    quantity: item.quantity,
    threshold: item.threshold,
    price: item.products.price,
    supplier: item.products.supplier,
    status: item.quantity <= 0 ? 'out_of_stock' : item.quantity <= item.threshold ? 'low_stock' : 'in_stock',
    lastUpdated: item.last_updated.split('T')[0],
  }));

  return NextResponse.json(flattenedData);
}
