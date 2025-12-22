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
import AIAnalysisResult from "./AIAnalysisResult";
import { reportGenerator } from "@/lib/services/reportGenerator";
import { ThinkingStep } from "@/types/analysis";

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
    if (!order || !order.id) {
      console.error("无效的订单对象:", order);
      return;
    }
    
    console.log("开始分析订单:", order.order_number);
    
    // 设置订单并打开对话框
    setSelectedOrder(order);
    setIsAnalyzing(true);
    setShowAnalysis(true);
    
    try {
      const result = await aiService.analyzeOrder(order);
      console.log("获取到分析初始化结果:", result);
      
      if (result) {
        setAnalysisResult(prev => ({ ...prev, [order.id]: result }));
      }
    } catch (error) {
      console.error("AI分析触发失败:", error);
      // Only set isAnalyzing to false on error - let AIAnalysisResult handle completion
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

  const handleExportAnalysis = async (customThinkingSteps?: ThinkingStep[]) => {
    if (!selectedOrder || !analysisResult || !selectedOrder.id) {
      console.error("无法导出：缺少订单或分析结果");
      return;
    }

    try {
      // 确保有思考步骤数据供报告使用
      const thinkingSteps = customThinkingSteps || [
        { id: 1, type: 'observation', content: '收集订单基本信息...' },
        { id: 2, type: 'observation', content: `分析订单 ${selectedOrder.order_number} 的产品信息和数量...` },
        { id: 3, type: 'analysis', content: `检查订单金额 ¥${selectedOrder.value.toLocaleString()} 是否与市场价格一致...` },
        { id: 4, type: 'observation', content: '查找相关历史订单数据...' },
        { id: 5, type: 'insight', content: `发现客户 "${selectedOrder.customer}" 的历史订单模式...` },
        { id: 6, type: 'insight', content: '检测到订单异常点: 产品价格偏离历史均价超过 35%' }
      ];

      // 生成PDF文档
      const doc = await reportGenerator.generatePDF(
        analysisResult[selectedOrder.id],
        selectedOrder,
        thinkingSteps,
        {
          includeThinking: true,
          includeSummary: true,
          includeFindings: true,
          includeCharts: true
        }
      );

      // 保存PDF文件
      const fileName = `order-analysis-${selectedOrder.order_number}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("导出PDF失败:", error);
    }
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
              onClick={() => handleExportAnalysis()}
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

      <Dialog open={showAnalysis} onOpenChange={(open) => {
        setShowAnalysis(open);
        if (!open) {
          // 关闭对话框时重置状态
          setIsAnalyzing(false);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] h-auto overflow-hidden p-0 border-none bg-transparent shadow-none">
          <DialogTitle className="sr-only">AI 分析结果</DialogTitle>
          <div className="flex-1 overflow-hidden">
            <AIAnalysisResult
              order={selectedOrder}
              analysisResult={selectedOrder ? analysisResult[selectedOrder.id] : null}
              onExport={(steps) => handleExportAnalysis(steps)}
              onClose={() => setShowAnalysis(false)}
              isAnalyzing={isAnalyzing}
            />
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