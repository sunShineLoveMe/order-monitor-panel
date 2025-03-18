import type { Order, InventoryItem } from "@/lib/data";
import { DatabaseService } from "./database";
import { supabase } from "@/lib/supabase";

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
  monthlyStats: Array<{
    month: string;
    inbound: number;
    outbound: number;
  }>;
}

export interface DashboardUpdate {
  type: "stats" | "order" | "inventory";
  timestamp: number;
  data: DashboardStats;
}

type Subscriber = (update: DashboardUpdate) => void;

class DashboardService {
  private subscribers: Set<Subscriber> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  // 获取实时统计数据
  async getStats(): Promise<DashboardStats> {
    try {
      return await DatabaseService.getDashboardStats();
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      throw error;
    }
  }

  // 订阅实时更新
  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // 开始实时数据模拟
  startRealtimeUpdates() {
    if (this.updateInterval) return;

    // 每30秒更新一次统计数据
    this.updateInterval = setInterval(() => {
      this.notifySubscribers("stats");
    }, 30000);

    // 订阅 Supabase 实时更新
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
        () => this.notifySubscribers("order"))
      .subscribe();

    const inventorySubscription = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, 
        () => this.notifySubscribers("inventory"))
      .subscribe();

    return () => {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      ordersSubscription.unsubscribe();
      inventorySubscription.unsubscribe();
    };
  }

  stopRealtimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async notifySubscribers(type: DashboardUpdate["type"]) {
    try {
      const stats = await this.getStats();
      const update: DashboardUpdate = {
        type,
        timestamp: Date.now(),
        data: stats,
      };
      this.subscribers.forEach(subscriber => subscriber(update));
    } catch (error) {
      console.error('通知订阅者失败:', error);
    }
  }
}

export const dashboardService = new DashboardService(); 