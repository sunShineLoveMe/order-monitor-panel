export interface Order {
  id: string;
  order_number: string;
  customer: string;
  product_name: string;
  quantity: number;
  value: number;
  status: 'completed' | 'processing' | 'pending' | 'exception';
  date: string;
  type: 'inbound' | 'outbound';
  created_at: string;
  updated_at: string;
  exceptions?: Array<{
    type: string;
    description: string;
    created_at: string;
    resolved_at?: string;
    status: 'open' | 'resolved';
  }>;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  threshold: number;
  location: string;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  supplier: string;
} 