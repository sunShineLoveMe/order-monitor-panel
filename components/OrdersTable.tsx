"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockOrders, exceptionTypes, type Order, type ExceptionInfo } from "@/lib/data";
import { MoreHorizontal, AlertTriangle, CheckCircle2, Clock, Loader2, BrainCircuit, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AIService, aiService } from "@/lib/services/ai";
import type { OrderAnalysis, AnomalyDetectionResult } from "@/lib/services/ai";
import { exceptionService } from "@/lib/services/exception";
import { ExceptionHandlingPanel } from "@/components/ExceptionHandlingPanel";
import { DatabaseService } from "@/lib/services/database";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontalIcon, AlertTriangleIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Order as OrderType } from "@/lib/types";

const statusIcons = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle2,
  exception: AlertTriangle,
};

const statusColors = {
  pending: "text-yellow-500",
  processing: "text-blue-500",
  completed: "text-green-500",
  exception: "text-red-500",
};

interface OrdersTableProps {
  type?: "inbound" | "outbound";
  className?: string;
}

export default function OrdersTable({ type, className }: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Record<string, OrderAnalysis>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [batchAnalysisResults, setBatchAnalysisResults] = useState<Record<string, OrderAnalysis>>({});
  const [anomalyResults, setAnomalyResults] = useState<Record<string, AnomalyDetectionResult>>({});
  const [showExceptionPanel, setShowExceptionPanel] = useState(false);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadOrders();
    // 订阅实时更新
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => loadOrders())
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [type, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await DatabaseService.getOrders(type, currentPage, pageSize);
      setOrders(result.orders);
      setTotalOrders(result.total);
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async () => {
    try {
      const results: Record<string, AnomalyDetectionResult> = {};
      for (const orderId of Array.from(selectedOrders)) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const result = await aiService.detectAnomalies(order);
          results[orderId] = result;
        }
      }
      setAnomalyResults(results);
      setShowAnomalies(true);
    } catch (error) {
      console.error("异常检测失败:", error);
    }
  };

  const handleAnalyzeOrder = async (order: OrderType) => {
    setSelectedOrders(new Set([order.id]));
    
    try {
      const result = await aiService.analyzeOrder(order);
      setAnalysisResult({ [order.id]: result });
    } catch (error) {
      console.error("AI分析失败:", error);
    }
  };

  const handleBatchAnalyze = async () => {
    try {
      const selectedOrdersList = orders.filter(order => 
        selectedOrders.has(order.id));
      const analysisResults = await aiService.analyzeOrders(selectedOrdersList);
      const resultsMap: Record<string, OrderAnalysis> = {};
      analysisResults.forEach(result => {
        resultsMap[result.orderId] = result;
      });
      setAnalysisResult(resultsMap);
      setShowAnalysis(true);
    } catch (error) {
      console.error("批量分析失败:", error);
    }
  };

  const handleExportAnalysis = () => {
    if (!analysisResult) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      analysis: analysisResult,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-analysis-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
  };

  const handleOrderAction = async (order: OrderType, action: string) => {
    try {
      switch (action) {
        case 'complete':
          await DatabaseService.updateOrder(order.id, { status: 'completed' });
          break;
        case 'cancel':
          await DatabaseService.updateOrder(order.id, { status: 'exception', exceptions: [
            ...(order.exceptions || []),
            {
              type: 'cancelled',
              description: '订单已取消',
              status: 'open',
              created_at: new Date().toISOString()
            }
          ]});
          break;
        case 'exception':
          setSelectedOrder(order);
          setShowExceptionDialog(true);
          return;
      }
      await loadOrders();
    } catch (error) {
      console.error('处理订单操作失败:', error);
    }
  };

  const handleExceptionSubmit = async () => {
    if (!selectedOrder) return;

    try {
      await exceptionService.manuallyHandleException(
        selectedOrder.id,
        selectedResolution,
        `${exceptionReason}\n备注: ${resolutionNote}`
      );
      await DatabaseService.updateOrder(selectedOrder.id, { status: 'exception' });
      setShowExceptionDialog(false);
      setSelectedOrder(null);
      setExceptionReason('');
      setSelectedResolution('');
      setResolutionNote('');
      await loadOrders();
    } catch (error) {
      console.error('提交异常失败:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">待处理</Badge>;
      case 'processing':
        return <Badge variant="secondary">处理中</Badge>;
      case 'completed':
        return <Badge variant="default">已完成</Badge>;
      case 'cancelled':
        return <Badge>已取消</Badge>;
      case 'exception':
        return <Badge variant="destructive">异常</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: OrderType['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: OrderType['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '处理中';
      case 'pending':
        return '待处理';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchAnalyze}
            disabled={selectedOrders.size === 0 || analyzing}
          >
            {analyzing ? "分析中..." : "批量分析"}
          </Button>
          {analysisResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAnalysis}
            >
              导出分析结果
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          已选择 {selectedOrders.size} 个订单
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="搜索订单..."
          className="max-w-sm"
        />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="订单状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="processing">处理中</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedOrders.size === orders.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>订单编号</TableHead>
              <TableHead>{type === "inbound" ? "供应商" : "客户"}</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>日期</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  暂无订单数据
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                    />
                  </TableCell>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell className="text-right">{order.quantity}</TableCell>
                  <TableCell className="text-right">
                    ¥{order.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.date).toLocaleString("zh-CN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.type === 'inbound' ? 'default' : 'secondary'}>
                      {order.type === 'inbound' ? '入库' : '出库'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {order.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleOrderAction(order, 'complete')}
                            >
                              完成订单
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOrderAction(order, 'cancel')}
                            >
                              取消订单
                            </DropdownMenuItem>
                          </>
                        )}
                        {order.status !== 'exception' && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleOrderAction(order, 'exception')}
                          >
                            标记异常
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />
              AI 分析结果
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {analysisResult && Object.entries(analysisResult).map(([orderId, result]: [string, any]) => {
              const order = orders.find(o => o.id === orderId);
              return (
                <div key={orderId} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">订单 {order?.order_number}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order?.product_name} · {order?.customer}
                      </p>
                    </div>
                    <Badge
                      variant={
                        result.riskLevel === "low"
                          ? "default"
                          : result.riskLevel === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      风险等级: {result.riskLevel}
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <h5 className="font-medium mb-2">主要发现</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {result.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-sm">{insight}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">建议措施</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {result.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {result.potentialImpact && (
                      <div>
                        <h5 className="font-medium mb-2">潜在影响</h5>
                        <div className="grid gap-2">
                          <div className="text-sm">
                            <span className="font-medium">财务影响: </span>
                            ¥{result.potentialImpact.financial.toLocaleString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">运营影响: </span>
                            {result.potentialImpact.operational}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">客户满意度: </span>
                            {result.potentialImpact.customerSatisfaction}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>处理订单异常</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">异常详情</TabsTrigger>
                <TabsTrigger value="resolution">解决方案</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                {selectedOrder && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">订单信息</h4>
                      <p className="text-sm text-muted-foreground">
                        订单号: {selectedOrder.order_number}
                        <br />
                        客户: {selectedOrder.customer}
                        <br />
                        产品: {selectedOrder.product_name}
                        <br />
                        数量: {selectedOrder.quantity}
                        <br />
                        金额: ¥{selectedOrder.value.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">异常原因</h4>
                      <textarea
                        className="w-full mt-2 p-2 border rounded-md"
                        rows={3}
                        placeholder="请输入异常原因..."
                        value={exceptionReason}
                        onChange={(e) => setExceptionReason(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="resolution">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">建议解决方案</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="resolution"
                          value="contact_supplier"
                          checked={selectedResolution === 'contact_supplier'}
                          onChange={(e) => setSelectedResolution(e.target.value)}
                        />
                        <label>联系供应商确认库存情况</label>
                      </li>
                      <li className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="resolution"
                          value="adjust_quantity"
                          checked={selectedResolution === 'adjust_quantity'}
                          onChange={(e) => setSelectedResolution(e.target.value)}
                        />
                        <label>调整订单数量</label>
                      </li>
                      <li className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="resolution"
                          value="cancel_refund"
                          checked={selectedResolution === 'cancel_refund'}
                          onChange={(e) => setSelectedResolution(e.target.value)}
                        />
                        <label>取消订单并退款</label>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">备注</h4>
                    <textarea
                      className="w-full mt-2 p-2 border rounded-md"
                      rows={3}
                      placeholder="请输入处理备注..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={handleExceptionSubmit}>
                      确认提交
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* 分页控件 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalOrders)} 条，共 {totalOrders} 条
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * pageSize >= totalOrders}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
} 