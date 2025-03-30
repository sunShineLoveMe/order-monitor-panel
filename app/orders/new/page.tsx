'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Trash2, ArrowLeft, ScanLine } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<'inbound' | 'outbound'>('inbound');
  const [orderData, setOrderData] = useState({
    orderNumber: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    customer: {
      name: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: ''
    },
    currency: 'CNY',
    paymentTerms: '',
    notes: ''
  });
  const [items, setItems] = useState<{
    id: string,
    description: string,
    quantity: number,
    unitPrice: number,
    amount: number
  }[]>([]);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0
  });
  const [loading, setLoading] = useState(false);

  // 处理订单基本信息变更
  const handleOrderChange = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理客户信息变更
  const handleCustomerChange = (field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  // 处理商品明细变更
  const handleItemChange = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // 自动计算金额
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  // 添加新商品
  const handleAddItem = () => {
    if (!newItem.description) return;
    
    const amount = newItem.quantity * newItem.unitPrice;
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      ...newItem,
      amount
    }]);
    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    });
  };

  // 删除商品
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // 计算订单总金额
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  // 处理新商品信息变更
  const handleNewItemChange = (field: string, value: string | number) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      // 自动计算金额
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = updated.quantity * updated.unitPrice;
      }
      return updated;
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    setLoading(true);
    // 这里可以添加实际的提交逻辑，如API调用
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 提交成功，跳转到订单列表页
    router.push('/orders');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">创建新订单</h1>
        </div>
        
        <Select value={orderType} onValueChange={(value: 'inbound' | 'outbound') => setOrderType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择订单类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbound">入库订单</SelectItem>
            <SelectItem value="outbound">出库订单</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>订单基本信息</CardTitle>
            <CardDescription>
              填写订单的基本信息，包括订单号、日期和{orderType === 'inbound' ? '供应商' : '客户'}信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">订单编号</Label>
                <Input
                  id="orderNumber"
                  value={orderData.orderNumber}
                  onChange={(e) => handleOrderChange('orderNumber', e.target.value)}
                  placeholder="例如：PO-2023-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">订单日期</Label>
                <Input
                  id="date"
                  type="date"
                  value={orderData.date}
                  onChange={(e) => handleOrderChange('date', e.target.value)}
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {orderType === 'inbound' ? '供应商信息' : '客户信息'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {orderType === 'inbound' ? '供应商名称' : '客户名称'}
                  </Label>
                  <Input
                    id="name"
                    value={orderData.customer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">联系人</Label>
                  <Input
                    id="contactPerson"
                    value={orderData.customer.contactPerson}
                    onChange={(e) => handleCustomerChange('contactPerson', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">地址</Label>
                  <Textarea
                    id="address"
                    value={orderData.customer.address}
                    onChange={(e) => handleCustomerChange('address', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    value={orderData.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={orderData.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">货币</Label>
                <Select
                  value={orderData.currency}
                  onValueChange={(value) => handleOrderChange('currency', value)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="选择货币" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNY">人民币 (¥)</SelectItem>
                    <SelectItem value="USD">美元 ($)</SelectItem>
                    <SelectItem value="EUR">欧元 (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">付款条款</Label>
                <Input
                  id="paymentTerms"
                  value={orderData.paymentTerms}
                  onChange={(e) => handleOrderChange('paymentTerms', e.target.value)}
                  placeholder="例如：款到发货"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={orderData.notes}
                onChange={(e) => handleOrderChange('notes', e.target.value)}
                placeholder="添加订单备注..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>商品明细</CardTitle>
            <CardDescription>
              添加订单中的商品明细，包括商品描述、数量、单价等信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">商品描述</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                        className="w-[80px] ml-auto"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                        className="w-[100px] ml-auto"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="添加新商品..."
                      value={newItem.description}
                      onChange={(e) => handleNewItemChange('description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={1}
                      value={newItem.quantity}
                      onChange={(e) => handleNewItemChange('quantity', parseInt(e.target.value))}
                      className="w-[80px] ml-auto"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={newItem.unitPrice}
                      onChange={(e) => handleNewItemChange('unitPrice', parseFloat(e.target.value))}
                      className="w-[100px] ml-auto"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {newItem.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleAddItem}
                      disabled={!newItem.description}
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell className="text-right font-medium">总计:</TableCell>
                  <TableCell className="text-right font-bold">
                    {calculateTotal().toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center">
                <Link href="/orders/scan" className="text-blue-600 hover:underline text-sm flex items-center">
                  <ScanLine className="h-4 w-4 mr-1" />
                  通过扫描图片添加商品
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                共 {items.length} 件商品
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-6">
            <Button variant="outline" asChild>
              <Link href="/orders">取消</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? '保存中...' : '保存订单'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 