import { Card, Title, BarChart } from '@tremor/react';
import type { Order } from '@/lib/types';

interface OrderChartProps {
  orders: Order[];
}

export function OrderChart({ orders }: OrderChartProps) {
  // 按日期分组统计订单数量
  const dailyOrders = orders.reduce((acc, order) => {
    const date = new Date(order.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 转换为图表数据格式
  const chartData = Object.entries(dailyOrders).map(([date, count]) => ({
    date,
    '订单数量': count
  }));

  return (
    <Card className="mb-6">
      <Title>每日订单统计</Title>
      <BarChart
        className="mt-4 h-72"
        data={chartData}
        index="date"
        categories={['订单数量']}
        colors={['blue']}
        yAxisWidth={48}
        showLegend={false}
      />
    </Card>
  );
} 