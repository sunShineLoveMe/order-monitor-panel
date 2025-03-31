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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>硅基流动API环境变量配置</CardTitle>
          <CardDescription>
            为解决硅基流动API连接问题，推荐使用环境变量进行配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">环境变量配置步骤</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>在项目根目录创建或编辑 <code className="bg-muted px-1 rounded">.env.local</code> 文件</li>
              <li>添加以下环境变量（替换API密钥为您的真实密钥）：</li>
            </ol>
            <div className="bg-muted p-4 rounded-md font-mono text-xs">
              <pre>{`# 硅基流动模型配置
DEFAULT_MODEL_PROVIDER=siliconflow
DEFAULT_MODEL=Qwen/Qwen2-VL-72B-Instruct
DEFAULT_MODEL_ID=siliconflow-qwen-vl
DEFAULT_MODEL_NAME=Qwen VL 多模态模型
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn/v1`}</pre>
            </div>
            <h3 className="text-sm font-medium mt-4">注意事项</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>API密钥应以 <code className="bg-muted px-1 rounded">sk-</code> 开头</li>
              <li>API端点URL不要包含末尾斜杠</li>
              <li>配置后需要重启应用服务器生效</li>
              <li>如需使用多模态功能，请确保选择支持多模态的模型</li>
            </ul>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => {
                // 复制环境变量模板到剪贴板
                navigator.clipboard.writeText(`# 硅基流动模型配置
DEFAULT_MODEL_PROVIDER=siliconflow
DEFAULT_MODEL=Qwen/Qwen2-VL-72B-Instruct
DEFAULT_MODEL_ID=siliconflow-qwen-vl
DEFAULT_MODEL_NAME=Qwen VL 多模态模型
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn/v1`);
                alert('环境变量模板已复制到剪贴板');
              }}
            >
              复制环境变量模板
            </Button>
          </div>
        </CardContent>
      </Card>

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

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-1">硅基流动API测试</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  点击下方按钮测试硅基流动API连接并获取可用模型列表
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                  onClick={async () => {
                    if (modelConfig.provider !== 'siliconflow') {
                      alert('当前模型提供商不是硅基流动，请先切换到硅基流动提供商');
                      return;
                    }
                    
                    setTestInProgress(true);
                    setTestResult(null);
                    setError(null);
                    
                    try {
                      const apiUrl = modelConfig.baseUrl || 'https://api.siliconflow.cn/v1';
                      const url = `${apiUrl}/models`;
                      
                      setTestResult(`正在测试硅基流动API连接: ${url}\n`);
                      
                      const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${modelConfig.apiKey}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      if (!response.ok) {
                        const errorText = await response.text();
                        setTestResult(prev => prev + `\n请求失败: ${response.status} - ${errorText}`);
                        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
                      }
                      
                      const data = await response.json();
                      
                      setTestResult(prev => prev + `\n连接成功! 响应数据:\n${JSON.stringify(data, null, 2)}`);
                      
                      if (data?.data?.length > 0) {
                        const modelList = data.data.map((model: any) => model.id);
                        setTestResult(prev => prev + `\n\n找到 ${modelList.length} 个可用模型:\n${modelList.join('\n')}`);
                      } else {
                        setTestResult(prev => prev + '\n\n未找到可用模型，请检查API权限');
                      }
                    } catch (err) {
                      setError(`测试失败: ${err instanceof Error ? err.message : String(err)}`);
                      console.error(err);
                    } finally {
                      setTestInProgress(false);
                    }
                  }}
                >
                  {testInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    '测试硅基流动API'
                  )}
                </Button>
                
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open('https://docs.siliconflow.cn/cn/api-reference/models/get-model-list', '_blank')}
                >
                  查看API文档
                </Button>
              </div>

              {testResult && (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-1">测试结果</h3>
                    <Textarea 
                      value={testResult} 
                      readOnly 
                      className="font-mono text-xs h-48"
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
    </div>
  );
} 