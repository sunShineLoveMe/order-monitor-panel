import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DashboardStats {
  totalInventory: number;
  inboundCount: number;
  outboundCount: number;
  exceptionCount: number;
  monthlyGrowth: {
    inventory: number;
    inbound: number;
    outbound: number;
    exception: number;
  };
  inventoryTurnover: {
    overall: number;
    highDemand: number;
    lowDemand: number;
  };
  monthlyStats: any[];
}

export interface MonthlyStats {
  month: string;
  inbound: number;
  outbound: number;
}

export interface OrderFilters {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export class DatabaseService {
  static async getOrders(type?: string, page: number = 1, pageSize: number = 10): Promise<{ orders: any[], total: number }> {
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, count, error } = await query
        .order('order_date', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      const orders = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer: order.customer_name,
        product_name: order.product_name,
        quantity: order.quantity,
        value: Number(order.total_value),
        status: order.status as 'completed' | 'processing' | 'pending' | 'exception',
        date: order.order_date,
        type: order.type as 'inbound' | 'outbound',
        created_at: order.created_at,
        updated_at: order.updated_at
      }));

      return { orders, total: count || 0 };
    } catch (error) {
      console.error('获取订单失败:', error);
      throw error;
    }
  }

  static async updateOrder(id: string, updates: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('更新订单失败:', error);
      throw error;
    }
  }

  static async createOrder(order: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .insert(order);

      if (error) throw error;
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  }

  static async getInventory(filters?: { location?: string; status?: string; search?: string }): Promise<any[]> {
    try {
      let query = supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          threshold,
          last_updated,
          products (
            id,
            name,
            sku,
            category,
            price,
            supplier
          ),
          warehouses (
            id,
            name,
            code
          )
        `);

      if (filters?.location && filters.location !== 'all') {
        query = query.filter('warehouses.name', 'eq', filters.location);
      }
      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'low') {
          query = query.lte('quantity', 'threshold');
        } else if (filters.status === 'out') {
          query = query.eq('quantity', 0);
        } else if (filters.status === 'normal') {
          query = query.gt('quantity', 'threshold');
        }
      }
      if (filters?.search) {
        query = query.ilike('products.name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.products?.name,
        sku: item.products?.sku,
        category: item.products?.category,
        quantity: item.quantity,
        threshold: item.threshold,
        location: item.warehouses?.name || '未知仓库',
        price: item.products?.price,
        status: item.quantity <= 0 ? 'out_of_stock' : item.quantity <= item.threshold ? 'low_stock' : 'in_stock',
        lastUpdated: item.last_updated,
        supplier: item.products?.supplier
      }));
    } catch (error) {
      console.error('获取库存失败:', error);
      throw error;
    }
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [{ count: inboundCount }, { count: outboundCount }, { count: totalProducts }, { count: exceptions }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('type', 'inbound'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('type', 'outbound'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'exception')
      ]);

      const monthlyStats = await this.calculateMonthlyStats();

      return {
        totalInventory: totalProducts || 0,
        inboundCount: inboundCount || 0,
        outboundCount: outboundCount || 0,
        exceptionCount: exceptions || 0,
        monthlyGrowth: {
          inventory: 12.5,
          inbound: 8.2,
          outbound: 5.4,
          exception: -2.1
        },
        inventoryTurnover: {
          overall: 4.2,
          highDemand: 6.8,
          lowDemand: 1.2
        },
        monthlyStats
      };
    } catch (error) {
      console.error('获取仪表盘统计失败:', error);
      throw error;
    }
  }

  static async getSalesPredictions(filters: { timeframe: 'short' | 'medium' | 'long', productId: string | null }): Promise<any[]> {
    // 模拟预测数据生成
    const months = filters.timeframe === 'short' ? 3 : filters.timeframe === 'medium' ? 6 : 12;
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const baseRevenue = 150000 + Math.random() * 50000;
        data.push({
            date: dateStr,
            revenue: baseRevenue * (1 + i * 0.05),
            quantity: Math.floor(baseRevenue / 1000),
            growthRate: 5 + Math.random() * 5,
            upperBound: baseRevenue * 1.2,
            lowerBound: baseRevenue * 0.8
        });
    }
    return data;
  }

  private static async calculateMonthlyStats(): Promise<MonthlyStats[]> {
    try {
      const { data, error } = await supabase
        .from('monthly_overview')
        .select('month, inbound, outbound')
        .order('month', { ascending: true });

      if (error) throw error;

      return (data || []).map(stat => ({
        month: stat.month,
        inbound: stat.inbound,
        outbound: stat.outbound
      }));
    } catch (error) {
      console.error('获取月度统计失败:', error);
      return [];
    }
  }

  static async getOrdersWithItems(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          order_exceptions (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取订单详情失败:', error);
      throw error;
    }
  }

  static async getPrediction(type: 'sales' | 'inventory'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ai_analysis_results')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data?.data;
    } catch (error) {
      console.error(`获取${type}预测失败:`, error);
      return null;
    }
  }

  static async getMonthlyOverview(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('monthly_overview')
        .select('*')
        .order('month', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取月度总览失败:', error);
      throw error;
    }
  }

  static async getAIInsights(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取 AI 洞察失败:', error);
      throw error;
    }
  }
}
