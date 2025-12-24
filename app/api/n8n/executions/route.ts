// n8n API 代理路由 - 获取工作流执行历史
import { NextResponse } from 'next/server';

// 从环境变量获取 n8n 配置
const getN8nConfig = () => {
  const baseUrl = process.env.N8N_API_URL || process.env.NEXT_PUBLIC_N8N_API_URL || 'http://54.252.239.164:5678';
  const apiKey = process.env.N8N_API_KEY || '';
  return { baseUrl, apiKey };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const status = searchParams.get('status') || '';
    
    const { baseUrl, apiKey } = getN8nConfig();
    
    // 构建 n8n API URL
    // 注意：n8n 的内部 REST API 端点是 /rest/executions
    // 公共 API 端点是 /api/v1/executions（需要 API Key）
    let n8nUrl = `${baseUrl}/rest/executions?limit=${limit}`;
    if (status) {
      n8nUrl += `&status=${status}`;
    }
    
    console.log(`[n8n Proxy] 获取执行历史: ${n8nUrl}`);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // 如果有 API Key，使用公共 API
    if (apiKey) {
      n8nUrl = `${baseUrl}/api/v1/executions?limit=${limit}`;
      if (status) {
        n8nUrl += `&status=${status}`;
      }
      headers['X-N8N-API-KEY'] = apiKey;
    }
    
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[n8n Proxy] API 错误: ${response.status}`, errorText);
      return NextResponse.json({
        error: 'n8n_api_error',
        status: response.status,
        message: errorText.substring(0, 200),
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // 处理并格式化执行数据
    const executions = formatExecutions(data);
    
    // 计算汇总统计
    const summary = calculateSummary(executions);
    
    console.log(`[n8n Proxy] 成功获取 ${executions.length} 条执行记录`);
    
    return NextResponse.json({
      success: true,
      executions,
      summary,
      total: executions.length,
    });
  } catch (error: any) {
    console.error('[n8n Proxy] 请求失败:', error);
    return NextResponse.json({
      error: 'proxy_failed',
      message: error.message,
    }, { status: 500 });
  }
}

// 格式化执行记录
function formatExecutions(data: any) {
  // n8n 返回的数据结构可能是 { data: [...] } 或直接是数组
  const rawExecutions = Array.isArray(data) ? data : (data.data || data.results || []);
  
  return rawExecutions.map((exec: any) => {
    const startedAt = exec.startedAt || exec.started_at;
    const finishedAt = exec.stoppedAt || exec.finished_at || exec.finishedAt;
    const executionTime = startedAt && finishedAt 
      ? new Date(finishedAt).getTime() - new Date(startedAt).getTime()
      : null;
    
    // 尝试从执行数据中提取订单 ID
    let orderId = null;
    try {
      const executionData = exec.data || exec.executionData;
      if (executionData?.resultData?.runData) {
        const runData = executionData.resultData.runData;
        // 查找包含 order_id 的节点输出
        for (const nodeName of Object.keys(runData)) {
          const nodeData = runData[nodeName];
          if (Array.isArray(nodeData)) {
            for (const item of nodeData) {
              const json = item?.data?.main?.[0]?.[0]?.json;
              if (json?.order_id) {
                orderId = json.order_id;
                break;
              }
            }
          }
          if (orderId) break;
        }
      }
    } catch (e) {
      // 解析失败时忽略
    }
    
    return {
      id: exec.id?.toString() || '',
      orderId,
      workflowId: exec.workflowId?.toString() || exec.workflow_id?.toString() || '',
      workflowName: exec.workflowData?.name || exec.workflow?.name || '未知工作流',
      status: mapStatus(exec.status || exec.finished ? 'success' : 'running'),
      startedAt: startedAt || '',
      finishedAt: finishedAt || null,
      executionTime,
      triggerType: exec.mode || 'manual',
      nodeCount: Object.keys(exec.data?.resultData?.runData || {}).length || 0,
      retryCount: exec.retryOf ? 1 : 0,
    };
  });
}

// 映射状态
function mapStatus(status: string): 'success' | 'error' | 'running' | 'waiting' {
  const statusMap: Record<string, 'success' | 'error' | 'running' | 'waiting'> = {
    'success': 'success',
    'completed': 'success',
    'error': 'error',
    'failed': 'error',
    'crashed': 'error',
    'running': 'running',
    'new': 'waiting',
    'waiting': 'waiting',
  };
  return statusMap[status.toLowerCase()] || 'running';
}

// 计算汇总统计
function calculateSummary(executions: any[]) {
  const totalExecutions = executions.length;
  const successCount = executions.filter(e => e.status === 'success').length;
  const errorCount = executions.filter(e => e.status === 'error').length;
  const runningCount = executions.filter(e => e.status === 'running').length;
  
  const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;
  
  const executionTimes = executions
    .filter(e => e.executionTime !== null)
    .map(e => e.executionTime);
  const avgExecutionTime = executionTimes.length > 0
    ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
    : 0;
  
  // 按小时统计
  const hourCounts: Record<string, number> = {};
  executions.forEach(exec => {
    if (exec.startedAt) {
      const hour = new Date(exec.startedAt).getHours().toString().padStart(2, '0') + ':00';
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  const executionsByHour = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
  
  // 按状态统计
  const executionsByStatus = [
    { status: '成功', count: successCount, color: '#10b981' },
    { status: '失败', count: errorCount, color: '#ef4444' },
    { status: '运行中', count: runningCount, color: '#f59e0b' },
    { status: '等待', count: executions.filter(e => e.status === 'waiting').length, color: '#6b7280' },
  ];
  
  // 订单统计
  const orderCounts: Record<string, number> = {};
  executions.forEach(exec => {
    if (exec.orderId) {
      orderCounts[exec.orderId] = (orderCounts[exec.orderId] || 0) + 1;
    }
  });
  const topOrders = Object.entries(orderCounts)
    .map(([orderId, executionCount]) => ({ orderId, executionCount }))
    .sort((a, b) => b.executionCount - a.executionCount)
    .slice(0, 10);
  
  return {
    totalExecutions,
    successCount,
    errorCount,
    runningCount,
    successRate: Math.round(successRate * 10) / 10,
    avgExecutionTime: Math.round(avgExecutionTime),
    executionsByHour,
    executionsByStatus,
    topOrders,
    recentExecutions: executions.slice(0, 10),
  };
}
