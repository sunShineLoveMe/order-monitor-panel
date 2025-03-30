import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Edit2, Save, Trash2 } from 'lucide-react';

interface OrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Customer {
  name: string;
  address: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

interface ScanResult {
  orderNumber?: string;
  date?: string;
  supplier?: string;
  total?: number;
  currency?: string;
  items?: OrderItem[];
  customer?: Customer;
  paymentTerms?: string;
  notes?: string;
  confidence: number;
  rawText?: string;
}

interface OrderScanResultProps {
  result: ScanResult;
}

const OrderScanResult: React.FC<OrderScanResultProps> = ({ result }) => {
  const [editedResult, setEditedResult] = useState<ScanResult>(result);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('orderInfo');
  const [newItem, setNewItem] = useState<OrderItem>({ description: '', quantity: 1, unitPrice: 0, amount: 0 });

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleChange = (field: keyof ScanResult, value: any) => {
    setEditedResult(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerChange = (field: keyof Customer, value: any) => {
    setEditedResult(prev => ({
      ...prev,
      customer: {
        ...(prev.customer || { name: '', address: '' }),
        [field]: value
      }
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...(editedResult.items || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // 更新金额
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
      updatedItems[index].amount = quantity * unitPrice;
    }
    
    setEditedResult(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleAddItem = () => {
    const itemToAdd = {
      ...newItem,
      amount: newItem.quantity * newItem.unitPrice
    };
    
    setEditedResult(prev => ({
      ...prev,
      items: [...(prev.items || []), itemToAdd]
    }));
    setNewItem({ description: '', quantity: 1, unitPrice: 0, amount: 0 });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...(editedResult.items || [])];
    updatedItems.splice(index, 1);
    setEditedResult(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleNewItemChange = (field: keyof OrderItem, value: any) => {
    setNewItem(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // 自动计算金额
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = field === 'quantity' 
          ? value * prev.unitPrice 
          : prev.quantity * value;
      }
      
      return updated;
    });
  };

  const handleSave = () => {
    // 这里可以添加保存逻辑，如调用API保存订单
    console.log('保存订单数据:', editedResult);
    setEditing(false);
  };

  const calculateTotal = (): number => {
    if (!editedResult.items || editedResult.items.length === 0) return 0;
    return editedResult.items.reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Badge
            variant="outline"
            className={`px-2 py-1 ${
              editedResult.confidence >= 90
                ? 'bg-green-50 text-green-700 border-green-200'
                : editedResult.confidence >= 70
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            识别可信度: {editedResult.confidence}%
          </Badge>
        </div>
        <div>
          {editing ? (
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEditToggle}>
              <Edit2 className="h-4 w-4 mr-2" />
              编辑
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orderInfo">订单信息</TabsTrigger>
          <TabsTrigger value="items">商品明细</TabsTrigger>
          <TabsTrigger value="rawText">原始文本</TabsTrigger>
        </TabsList>

        <TabsContent value="orderInfo" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">订单编号</Label>
              <Input
                id="orderNumber"
                value={editedResult.orderNumber || ''}
                onChange={(e) => handleChange('orderNumber', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">订单日期</Label>
              <Input
                id="date"
                type="date"
                value={editedResult.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">供应商</Label>
              <Input
                id="supplier"
                value={editedResult.supplier || ''}
                onChange={(e) => handleChange('supplier', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">订单总金额</Label>
              <div className="flex">
                <Select
                  value={editedResult.currency || 'CNY'}
                  onValueChange={(value) => handleChange('currency', value)}
                  disabled={!editing}
                >
                  <SelectTrigger className="w-[80px] rounded-r-none">
                    <SelectValue placeholder="CNY" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNY">￥</SelectItem>
                    <SelectItem value="USD">$</SelectItem>
                    <SelectItem value="EUR">€</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="total"
                  type="number"
                  className="rounded-l-none"
                  value={editing ? editedResult.total || '' : calculateTotal()}
                  onChange={(e) => handleChange('total', parseFloat(e.target.value))}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h4 className="text-sm font-medium mb-2">客户信息</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">客户名称</Label>
                <Input
                  id="customerName"
                  value={editedResult.customer?.name || ''}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">联系人</Label>
                <Input
                  id="contactPerson"
                  value={editedResult.customer?.contactPerson || ''}
                  onChange={(e) => handleCustomerChange('contactPerson', e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">地址</Label>
                <Textarea
                  id="address"
                  value={editedResult.customer?.address || ''}
                  onChange={(e) => handleCustomerChange('address', e.target.value)}
                  disabled={!editing}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  value={editedResult.customer?.phone || ''}
                  onChange={(e) => handleCustomerChange('phone', e.target.value)}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedResult.customer?.email || ''}
                  onChange={(e) => handleCustomerChange('email', e.target.value)}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">付款条款</Label>
            <Input
              id="paymentTerms"
              value={editedResult.paymentTerms || ''}
              onChange={(e) => handleChange('paymentTerms', e.target.value)}
              disabled={!editing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={editedResult.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={!editing}
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="items" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">商品描述</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">单价</TableHead>
                <TableHead className="text-right">金额</TableHead>
                {editing && <TableHead className="w-[80px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {editedResult.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {editing ? (
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    ) : (
                      item.description
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editing ? (
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-[80px] ml-auto"
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editing ? (
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                        className="w-[100px] ml-auto"
                      />
                    ) : (
                      item.unitPrice.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.amount.toFixed(2)}
                  </TableCell>
                  {editing && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {editing && (
                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="商品描述"
                      value={newItem.description}
                      onChange={(e) => handleNewItemChange('description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={1}
                      placeholder="数量"
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
                      placeholder="单价"
                      value={newItem.unitPrice}
                      onChange={(e) => handleNewItemChange('unitPrice', parseFloat(e.target.value))}
                      className="w-[100px] ml-auto"
                    />
                  </TableCell>
                  <TableCell className="text-right">
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
              )}

              <TableRow>
                <TableCell colSpan={2}></TableCell>
                <TableCell className="text-right font-medium">总计:</TableCell>
                <TableCell className="text-right font-bold">
                  {calculateTotal().toFixed(2)}
                </TableCell>
                {editing && <TableCell></TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="rawText" className="pt-4">
          <Textarea
            value={editedResult.rawText || ''}
            readOnly
            rows={10}
            className="font-mono text-xs"
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline">取消</Button>
        <Button onClick={handleSave}>创建订单</Button>
      </div>
    </div>
  );
};

export default OrderScanResult; 