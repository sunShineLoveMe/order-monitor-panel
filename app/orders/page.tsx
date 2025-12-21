'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanels, TabPanel } from '@tremor/react';
import { DatabaseService } from '@/lib/services/database';
import { Order } from '@/lib/types';
import OrdersTable from '@/components/OrdersTable';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderChart } from '@/components/orders/OrderChart';
import { DailyOrderStats } from "@/components/DailyOrderStats";
import { mockOrders } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ScanLine, Plus } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadOrders();
  }, [activeTab, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const type = activeTab === 0 ? undefined : activeTab === 1 ? 'inbound' : 'outbound';
      const result = await DatabaseService.getOrders(type, currentPage, pageSize);
      setOrders(result.orders);
      setTotalOrders(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">订单管理</h2>
        
        <div className="flex items-center space-x-2">
          <Button asChild variant="outline">
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              新建订单
            </Link>
          </Button>
          <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/orders/scan">
              <ScanLine className="mr-2 h-4 w-4" />
              扫描订单图片
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <DailyOrderStats />
        
        <Card>
          <TabGroup index={activeTab} onIndexChange={setActiveTab}>
            <TabList>
              <Tab>全部订单</Tab>
              <Tab>入库订单</Tab>
              <Tab>出库订单</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <div className="mt-4">
                  <OrdersTable 
                    type={activeTab === 0 ? undefined : activeTab === 1 ? 'inbound' : 'outbound'} 
                    orders={orders}
                    loading={loading}
                    currentPage={currentPage}
                    totalOrders={totalOrders}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    className=""
                  />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>
      </div>
    </div>
  );
}
