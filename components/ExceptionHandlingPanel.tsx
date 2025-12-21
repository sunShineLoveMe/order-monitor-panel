"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowUpRightIcon,
  UserIcon,
  RefreshCwIcon,
  ListChecksIcon,
  ShieldIcon,
  Settings2Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exceptionService, type ExceptionHandlingResult, type AutoResolutionRule } from "@/lib/services/exception";
import { mockOrders } from "@/lib/data";

export function ExceptionHandlingPanel() {
  const [exceptionResults, setExceptionResults] = useState<ExceptionHandlingResult[]>([]);
  const [selectedException, setSelectedException] = useState<ExceptionHandlingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [rules, setRules] = useState<AutoResolutionRule[]>([]);

  useEffect(() => {
    // 订阅异常处理服务
    const unsubscribe = exceptionService.subscribe(exceptions => {
      setExceptionResults(exceptions);
    });

    // 初始化异常检测
    const initExceptions = async () => {
      setIsLoading(true);
      await exceptionService.detectAndHandleExceptions(mockOrders);
      setRules(exceptionService.getAllRules());
      setIsLoading(false);
    };

    initExceptions();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await exceptionService.detectAndHandleExceptions(mockOrders);
    setIsLoading(false);
  };

  const handleManualResolve = async (orderId: string, action: string) => {
    await exceptionService.manuallyHandleException(
      orderId,
      action,
      "手动处理完成"
    );
  };

  // 根据状态过滤异常
  const filteredExceptions = activeTab === "all" 
    ? exceptionResults 
    : exceptionResults.filter(ex => ex.status === activeTab);

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <RefreshCwIcon className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "escalated":
        return <ArrowUpRightIcon className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待处理";
      case "processing":
        return "处理中";
      case "resolved":
        return "已解决";
      case "escalated":
        return "已升级";
      default:
        return "未知";
    }
  };

  // 获取优先级样式
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "未知";
    }
  };

  // 格式化时间
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">异常订单处理</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                刷新中...
              </>
            ) : (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                刷新
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowRulesDialog(true)}
          >
            <Settings2Icon className="mr-2 h-4 w-4" />
            处理规则
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <ListChecksIcon className="h-4 w-4" />
            <span>全部</span>
            <Badge variant="secondary" className="ml-1">{exceptionResults.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>待处理</span>
            <Badge variant="secondary" className="ml-1">
              {exceptionResults.filter(ex => ex.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-1">
            <RefreshCwIcon className="h-4 w-4" />
            <span>处理中</span>
            <Badge variant="secondary" className="ml-1">
              {exceptionResults.filter(ex => ex.status === "processing").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="escalated" className="flex items-center gap-1">
            <ArrowUpRightIcon className="h-4 w-4" />
            <span>已升级</span>
            <Badge variant="secondary" className="ml-1">
              {exceptionResults.filter(ex => ex.status === "escalated").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4" />
            <span>已解决</span>
            <Badge variant="secondary" className="ml-1">
              {exceptionResults.filter(ex => ex.status === "resolved").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExceptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <AlertTriangleIcon className="h-12 w-12 mb-4" />
              <p>没有{activeTab === "all" ? "" : getStatusText(activeTab)}异常订单</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExceptions.map((exception) => (
                <Dialog key={exception.orderId}>
                  <Card className={cn(
                    "cursor-pointer hover:shadow-md transition-shadow",
                    exception.status === "escalated" && "border-red-200",
                    exception.status === "resolved" && "border-green-200"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(exception.status)}
                          <CardTitle className="text-base">{exception.order_number}</CardTitle>
                        </div>
                        <Badge className={getPriorityClass(exception.priority)}>
                          {getPriorityText(exception.priority)}优先级
                        </Badge>
                      </div>
                      <CardDescription>
                        异常类型: {exception.exceptionType}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">检测时间:</span>
                          <span>{formatTime(exception.detectedAt)}</span>
                        </div>
                        {exception.assignedTo && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">已分配给:</span>
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {exception.assignedTo}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">自动处理:</span>
                          <span>{exception.autoResolutionApplied ? "是" : "否"}</span>
                        </div>
                        {exception.estimatedResolutionTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">预计解决时间:</span>
                            <span>{formatTime(exception.estimatedResolutionTime)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedException(exception)}
                        >
                          查看详情
                        </Button>
                      </DialogTrigger>
                    </CardFooter>
                  </Card>

                  <DialogContent className="max-w-2xl">
                    {selectedException && (
                      <>
                        <DialogHeader>
                          <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                              {getStatusIcon(selectedException.status)}
                              <span>异常订单: {selectedException.order_number}</span>
                            </DialogTitle>
                            <Badge className={getPriorityClass(selectedException.priority)}>
                              {getPriorityText(selectedException.priority)}优先级
                            </Badge>
                          </div>
                        </DialogHeader>

                        <div className="space-y-6 my-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">基本信息</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">异常类型:</span>
                                  <span>{selectedException.exceptionType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">状态:</span>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(selectedException.status)}
                                    {getStatusText(selectedException.status)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">检测时间:</span>
                                  <span>{formatTime(selectedException.detectedAt)}</span>
                                </div>
                                {selectedException.assignedTo && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">已分配给:</span>
                                    <span>{selectedException.assignedTo}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">处理信息</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">自动处理:</span>
                                  <span>{selectedException.autoResolutionApplied ? "是" : "否"}</span>
                                </div>
                                {selectedException.estimatedResolutionTime && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">预计解决时间:</span>
                                    <span>{formatTime(selectedException.estimatedResolutionTime)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">处理步骤数:</span>
                                  <span>{selectedException.resolutionSteps.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">最后更新:</span>
                                  <span>
                                    {selectedException.resolutionSteps.length > 0
                                      ? formatTime(selectedException.resolutionSteps[selectedException.resolutionSteps.length - 1].timestamp)
                                      : "无"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">处理步骤</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                              {selectedException.resolutionSteps.map((step, index) => (
                                <div 
                                  key={index} 
                                  className={cn(
                                    "p-3 rounded-md border",
                                    step.automated ? "bg-muted/50" : "bg-white"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{step.action}</span>
                                    <div className="flex items-center gap-2">
                                      {step.automated ? (
                                        <Badge variant="outline" className="text-xs">自动</Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-primary/10 text-xs">手动</Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {formatTime(step.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                  {step.result && (
                                    <p className="text-sm text-muted-foreground">{step.result}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {selectedException.status !== "resolved" && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">手动处理</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleManualResolve(
                                    selectedException.orderId,
                                    "确认并解决异常"
                                  )}
                                >
                                  <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                                  确认并解决
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleManualResolve(
                                    selectedException.orderId,
                                    "联系客户确认"
                                  )}
                                >
                                  联系客户确认
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleManualResolve(
                                    selectedException.orderId,
                                    "调整订单信息"
                                  )}
                                >
                                  调整订单信息
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleManualResolve(
                                    selectedException.orderId,
                                    "转交专家处理"
                                  )}
                                >
                                  转交专家处理
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ShieldIcon className="h-3 w-3" />
                            <span>
                              {selectedException.autoResolutionApplied 
                                ? "已应用自动处理规则" 
                                : "未应用自动处理规则"}
                            </span>
                          </div>
                          <span>订单ID: {selectedException.orderId}</span>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 处理规则对话框 */}
      <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2Icon className="h-5 w-5" />
              异常订单自动处理规则
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="text-sm text-muted-foreground">
              系统会根据以下规则自动处理检测到的异常订单。当订单满足规则条件时，系统将执行相应的操作。
            </div>

            <div className="space-y-4">
              {rules.map((rule, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{rule.exceptionType}</CardTitle>
                      <Badge className={getPriorityClass(rule.priority)}>
                        {getPriorityText(rule.priority)}优先级
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">触发条件</h4>
                        <div className="space-y-1">
                          {rule.conditions.map((condition, i) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{condition.field}</span>
                              <span className="mx-1">
                                {condition.operator === "equals" && "等于"}
                                {condition.operator === "contains" && "包含"}
                                {condition.operator === "greaterThan" && "大于"}
                                {condition.operator === "lessThan" && "小于"}
                              </span>
                              <span>{condition.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">自动操作</h4>
                        <div className="space-y-1">
                          {rule.actions.map((action, i) => (
                            <div key={i} className="text-sm">
                              {action.type === "notify" && (
                                <span>通知 {action.target}: {action.message}</span>
                              )}
                              {action.type === "escalate" && (
                                <span>升级给 {action.target}</span>
                              )}
                              {action.type === "adjust" && (
                                <span>调整 {action.target} 为 {action.value}</span>
                              )}
                              {action.type === "reassign" && (
                                <span>重新分配给 {action.target}</span>
                              )}
                              {action.type === "cancel" && (
                                <span>取消订单</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 