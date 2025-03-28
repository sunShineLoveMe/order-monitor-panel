'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanels, TabPanel } from '@tremor/react';
import { DatabaseService } from '@/lib/services/database';
import { Order } from '@/lib/types';
import OrdersTable from '@/components/OrdersTable';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderChart } from '@/components/orders/OrderChart';

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
    <div className="p-6 space-y-6">
      <Title>订单管理</Title>
      
      <Card>
        <TabGroup index={activeTab} onIndexChange={setActiveTab}>
          <TabList>
            <Tab>全部订单</Tab>
            <Tab>入库订单</Tab>
            <Tab>出库订单</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <OrderStats orders={orders} />
              <OrderChart orders={orders} />
              <OrdersTable type={activeTab === 0 ? undefined : activeTab === 1 ? 'inbound' : 'outbound'} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Card>
    </div>
  );
}
