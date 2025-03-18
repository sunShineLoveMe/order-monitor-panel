import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Badge } from '@tremor/react';
import { Order } from '@/lib/types';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  currentPage: number;
  totalOrders: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function OrderTable({ orders, loading, currentPage, totalOrders, pageSize, onPageChange }: OrderTableProps) {
  const totalPages = Math.ceil(totalOrders / pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'yellow';
      case 'pending':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return <Text>加载中...</Text>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>订单编号</TableHeaderCell>
            <TableHeaderCell>客户</TableHeaderCell>
            <TableHeaderCell>产品</TableHeaderCell>
            <TableHeaderCell>数量</TableHeaderCell>
            <TableHeaderCell>金额</TableHeaderCell>
            <TableHeaderCell>状态</TableHeaderCell>
            <TableHeaderCell>日期</TableHeaderCell>
            <TableHeaderCell>类型</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_number}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.product_name}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>¥{order.value.toLocaleString()}</TableCell>
              <TableCell>
                <Badge color={getStatusColor(order.status)}>
                  {order.status === 'completed' ? '已完成' : 
                   order.status === 'processing' ? '处理中' : '待处理'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
              <TableCell>
                <Badge color={order.type === 'inbound' ? 'blue' : 'purple'}>
                  {order.type === 'inbound' ? '入库' : '出库'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 分页控件 */}
      <div className="flex items-center justify-between">
        <Text>
          显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalOrders)} 条，共 {totalOrders} 条
        </Text>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
} 