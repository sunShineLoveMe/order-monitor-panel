import { Card, Title, Text, Grid, Col } from '@tremor/react';
import type { Order } from '@/lib/types';

interface OrderStatsProps {
  orders: Order[];
}

export function OrderStats({ orders }: OrderStatsProps) {
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.value, 0);
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;

  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
      <Col>
        <Card>
          <Title>总订单数</Title>
          <Text>{totalOrders}</Text>
        </Card>
      </Col>
      <Col>
        <Card>
          <Title>总金额</Title>
          <Text>¥{totalValue.toLocaleString()}</Text>
        </Card>
      </Col>
      <Col>
        <Card>
          <Title>已完成订单</Title>
          <Text>{completedOrders}</Text>
        </Card>
      </Col>
      <Col>
        <Card>
          <Title>处理中订单</Title>
          <Text>{processingOrders}</Text>
        </Card>
      </Col>
    </Grid>
  );
} 