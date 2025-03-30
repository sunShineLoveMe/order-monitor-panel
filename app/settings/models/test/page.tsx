"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { aiService, ModelConfig } from "@/lib/services/ai";

export default function TestModelPage() {
  const [loading, setLoading] = useState(true);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null);
  const [testInProgress, setTestInProgress] = useState(false);

  useEffect(() => {
    // 加载当前配置的模型
    const loadModel = async () => {
      try {
        setLoading(true);
        // 获取默认的多模态模型
        const models = aiService.getModelConfigs();
        const model = models.find(m => 
          m.isDefault && 
          m.isEnabled && 
          m.supportsMultimodal && 
          m.multimodalConfig?.enabled
        ) || models.find(m => 
          m.isEnabled && 
          m.supportsMultimodal && 
          m.multimodalConfig?.enabled
        );

        if (model) {
          setModelConfig(model);
        } else {
          setError("未找到可用的多模态模型，请在模型设置中配置");
        }
      } catch (err) {
        setError("加载模型配置失败");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  const handleTestModel = async () => {
    if (!modelConfig) return;

    setTestInProgress(true);
    setTestResult(null);
    setError(null);

    try {
      // 创建一个简单的测试图像（1x1像素的透明图片）
      const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      
      // 设置测试图像URL
      setTestImageUrl(`data:image/png;base64,${base64Image}`);

      // 模拟API调用来验证模型配置
      const testResponse = {
        provider: modelConfig.provider,
        model: modelConfig.model,
        baseUrl: modelConfig.baseUrl,
        isMultimodalEnabled: modelConfig.multimodalConfig?.enabled,
        apiKeyConfigured: !!modelConfig.apiKey
      };

      // 显示测试结果
      setTestResult(JSON.stringify(testResponse, null, 2));

      // 向控制台输出更多信息供调试
      console.log("当前模型配置:", modelConfig);
    } catch (err) {
      setError("测试模型失败: " + (err instanceof Error ? err.message : String(err)));
      console.error(err);
    } finally {
      setTestInProgress(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings/models">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">模型配置测试</h1>
      </div>
      <p className="text-muted-foreground">
        测试当前配置的多模态模型是否正确设置
      </p>

      <Card>
        <CardHeader>
          <CardTitle>当前模型配置</CardTitle>
          <CardDescription>
            显示当前系统使用的多模态模型配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">配置错误</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : modelConfig ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">模型名称</h3>
                  <p className="text-sm px-3 py-1.5 bg-muted rounded-md">{modelConfig.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">提供商</h3>
                  <p className="text-sm px-3 py-1.5 bg-muted rounded-md">{modelConfig.provider}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">模型版本</h3>
                  <p className="text-sm px-3 py-1.5 bg-muted rounded-md">{modelConfig.model}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">API密钥</h3>
                  <p className="text-sm px-3 py-1.5 bg-muted rounded-md">
                    {modelConfig.apiKey ? "已配置" : "未配置"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-1">API端点</h3>
                <p className="text-sm px-3 py-1.5 bg-muted rounded-md break-all">
                  {modelConfig.baseUrl || "默认端点"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">多模态配置</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${modelConfig.multimodalConfig?.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-sm">
                    {modelConfig.multimodalConfig?.enabled ? "已启用" : "未启用"}
                  </p>
                </div>
              </div>

              {testResult && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-1">测试结果</h3>
                    <Textarea 
                      value={testResult} 
                      readOnly 
                      className="font-mono text-xs h-32"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>未找到模型配置</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/settings/models">返回设置</Link>
          </Button>
          <Button 
            onClick={handleTestModel} 
            disabled={!modelConfig || testInProgress}
          >
            {testInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                测试中...
              </>
            ) : (
              '测试模型配置'
            )}
          </Button>
        </CardFooter>
      </Card>

      {modelConfig && (
        <Card>
          <CardHeader>
            <CardTitle>解决硅基流动API问题</CardTitle>
            <CardDescription>
              如果您使用的是硅基流动模型，请查看以下解决方案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              对于硅基流动的Qwen2-VL-72B-Instruct模型，请确保以下配置正确：
            </p>
            
            <div className="p-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-md space-y-2">
              <h3 className="font-medium">检查以下设置：</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>确保模型提供商(provider)设置为"siliconflow"</li>
                <li>确保API密钥格式正确（以sk-开头）</li>
                <li>确保API端点设置为 https://api.siliconflow.cn/v1</li>
                <li>确保多模态支持已启用</li>
                <li>确保模型名称设置为正确的Qwen2-VL-72B-Instruct</li>
              </ol>
            </div>

            <div className="p-4 border border-amber-200 bg-amber-50 text-amber-700 rounded-md">
              <p className="font-medium">您看到的错误：</p>
              <p className="text-sm">在API调用时出现了连接错误 (TypeError: fetch failed)，通常是由于以下原因之一：</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>API端点URL格式不正确</li>
                <li>API密钥格式错误或无效</li>
                <li>硅基流动模型访问受限或需要特定权限</li>
                <li>网络连接问题或防火墙设置</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/settings/models'}
              variant="outline"
              className="w-full"
            >
              返回修改模型设置
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>设置环境变量</CardTitle>
          <CardDescription>
            设置硅基流动模型的环境变量（仅作测试用）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">设置方法</h3>
            <p className="text-sm text-muted-foreground">
              为了解决配置问题，您可以按照以下步骤直接修改.env.local文件：
            </p>
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-auto">
{`# 硅基流动模型配置
DEFAULT_MODEL_PROVIDER=siliconflow
DEFAULT_MODEL=Qwen2-VL-72B-Instruct
DEFAULT_MODEL_ID=siliconflow-qwen2-vl
DEFAULT_MODEL_NAME=Qwen2 VL 多模态模型
SILICONFLOW_API_KEY=sk-your-api-key-here
SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn/v1`}
            </pre>
            <p className="text-sm text-amber-600 mt-4">
              ⚠️ 注意：设置环境变量后需要重启服务器才能生效
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">当前环境变量</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">提供商</p>
                <p className="text-xs px-3 py-1.5 bg-muted rounded-md">
                  {process.env.DEFAULT_MODEL_PROVIDER || '未设置'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">模型</p>
                <p className="text-xs px-3 py-1.5 bg-muted rounded-md">
                  {process.env.DEFAULT_MODEL || '未设置'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">API端点</p>
                <p className="text-xs px-3 py-1.5 bg-muted rounded-md overflow-hidden text-ellipsis">
                  {process.env.SILICONFLOW_API_BASE_URL || '未设置'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">API密钥</p>
                <p className="text-xs px-3 py-1.5 bg-muted rounded-md">
                  {process.env.SILICONFLOW_API_KEY ? '已设置' : '未设置'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 