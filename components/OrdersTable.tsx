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
  type?: 'inbound' | 'outbound';
  className?: string;
  orders?: Order[];
  loading?: boolean;
  currentPage?: number;
  totalOrders?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export default function OrdersTable({ 
  type, 
  className,
  orders: externalOrders,
  loading: externalLoading,
  currentPage: externalCurrentPage,
  totalOrders: externalTotalOrders,
  pageSize: externalPageSize,
  onPageChange: externalOnPageChange
}: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderType[]>(externalOrders || []);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(externalLoading || false);
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
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [totalOrders, setTotalOrders] = useState(externalTotalOrders || 0);
  const pageSize = externalPageSize || 10;

  useEffect(() => {
    if (externalOrders) {
      setOrders(externalOrders);
    } else {
      loadOrders();
    }
  }, [type, currentPage, externalOrders]);

  useEffect(() => {
    if (externalLoading !== undefined) {
      setLoading(externalLoading);
    }
  }, [externalLoading]);

  useEffect(() => {
    if (externalCurrentPage !== undefined) {
      setCurrentPage(externalCurrentPage);
    }
  }, [externalCurrentPage]);

  useEffect(() => {
    if (externalTotalOrders !== undefined) {
      setTotalOrders(externalTotalOrders);
    }
  }, [externalTotalOrders]);

  const loadOrders = async () => {
    if (externalOrders) return;
    
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
    setSelectedOrder(order);
    setIsAnalyzing(true);
    
    try {
      const result = await aiService.analyzeOrder(order);
      setAnalysisResult({ [order.id]: result });
      setShowAnalysis(true);
    } catch (error) {
      console.error("AI分析失败:", error);
    } finally {
      setIsAnalyzing(false);
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
    if (externalOnPageChange) {
      externalOnPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status: OrderType['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:from-green-100 hover:to-green-200';
      case 'processing':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 hover:from-amber-100 hover:to-amber-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200';
      case 'exception':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:from-gray-100 hover:to-gray-200';
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
      case 'exception':
        return '异常订单';
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
            <SelectItem value="all">全部状态</SelectItem>
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
                    <Badge 
                      className={cn(
                        "px-3 py-1.5 rounded-full font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md",
                        "border border-transparent backdrop-blur-sm",
                        getStatusColor(order.status)
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {order.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {order.status === 'processing' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                        {order.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {order.status === 'exception' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {getStatusText(order.status)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.date).toLocaleString("zh-CN")}
                  </TableCell>
                  <TableCell>
                    {order.status === 'exception' ? (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 h-8"
                        onClick={() => handleAnalyzeOrder(order)}
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        AI智能分析
                      </Button>
                    ) : (
                      <Badge variant={order.type === 'inbound' ? 'default' : 'secondary'}>
                        {order.type === 'inbound' ? '入库' : '出库'}
                      </Badge>
                    )}
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
              <BrainCircuit className="h-5 w-5 text-blue-500" />
              AI 智能分析结果
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">正在分析订单数据...</p>
              </div>
            ) : analysisResult && Object.entries(analysisResult).map(([orderId, result]) => {
              const order = orders.find(o => o.id === orderId);
              return (
                <div key={orderId} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">订单 {order?.order_number}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order?.product_name} · {order?.customer}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "px-3 py-1 rounded-md",
                        result.riskScore > 0.5 ? "bg-red-100 text-red-800" : 
                        result.riskScore > 0.3 ? "bg-amber-100 text-amber-800" : 
                        "bg-green-100 text-green-800"
                      )}
                    >
                      风险评分: {(result.riskScore * 10).toFixed(1)}
                    </Badge>
                  </div>

                  <div className="grid gap-4 mt-4">
                    <div>
                      <h5 className="font-medium mb-2 text-slate-800">分析发现</h5>
                      <div className="space-y-3">
                        {result.findings.map((finding, index) => (
                          <div key={index} className={cn(
                            "p-3 rounded-md",
                            finding.severity === 'high' ? "bg-red-50 border border-red-100" :
                            finding.severity === 'medium' ? "bg-amber-50 border border-amber-100" :
                            "bg-blue-50 border border-blue-100"
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              {finding.severity === 'high' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              {finding.severity === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                              {finding.severity === 'low' && <AlertTriangle className="h-4 w-4 text-blue-500" />}
                              <span className="font-medium">{finding.category}</span>
                            </div>
                            <p className="text-sm mb-2">{finding.description}</p>
                            {finding.recommendations.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">建议: </span>
                                <ul className="list-disc list-inside space-y-1 pl-1 mt-1">
                                  {finding.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2 text-slate-800">总结</h5>
                      <p className="text-sm p-3 bg-white rounded-md border">{result.summary}</p>
                    </div>

                    {result.relatedOrders && result.relatedOrders.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-slate-800">相关订单</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {result.relatedOrders.map((orderNum, idx) => (
                            <Badge key={idx} variant="outline" className="justify-start">
                              {orderNum}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowAnalysis(false)}>
              关闭
            </Button>
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              onClick={handleExportAnalysis}
            >
              <Download className="mr-2 h-4 w-4" />
              导出分析报告
            </Button>
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