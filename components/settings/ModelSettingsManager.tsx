"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save, AlertCircle, Check, X, Database } from "lucide-react";
import { ModelConfig, ModelProvider, modelProviders, EmbeddingModelConfig, embeddingModels, aiService } from "@/lib/services/ai";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function ModelSettingsManager() {
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [embeddingConfigs, setEmbeddingConfigs] = useState<EmbeddingModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("models");
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [editingEmbedding, setEditingEmbedding] = useState<EmbeddingModelConfig | null>(null);
  const [testStatus, setTestStatus] = useState<{
    id: string, 
    status: 'idle' | 'loading' | 'success' | 'error', 
    message?: string, 
    availableModels?: string[]
  }>({id: '', status: 'idle'});
  const [availableModelList, setAvailableModelList] = useState<string[]>([]);
  const [pulsatingModels, setPulsatingModels] = useState<{[key: string]: boolean}>({});

  const { toast } = useToast();
  const router = useRouter();

  // 页面加载时获取已有的模型配置
  useEffect(() => {
    // 加载聊天模型配置
    const configs = aiService.getModelConfigs();
    if (configs && configs.length > 0) {
      setModelConfigs(configs);
    } else {
      // 如果没有配置，使用默认配置
      setModelConfigs([
        {
          id: "default-openai",
          name: "GPT-4",
          provider: "openai",
          apiKey: "",
          model: "gpt-4-turbo",
          isDefault: true,
          isEnabled: true,
          supportsMultimodal: true,
          contextLength: 128000,
          temperature: 0.7,
          proxyUrl: "",
          multimodalConfig: {
            maxImageSize: 4096,
            supportedFormats: ["jpeg", "png", "webp"],
            enabled: true
          }
        }
      ]);
    }

    // 加载Embedding模型配置
    const embConfigs = aiService.getEmbeddingConfigs();
    if (embConfigs && embConfigs.length > 0) {
      setEmbeddingConfigs(embConfigs);
    } else {
      // 如果没有配置，使用默认配置
      setEmbeddingConfigs([...embeddingModels]);
    }
  }, []);

  // 添加新的聊天模型
  const handleAddModel = () => {
    const newModel: ModelConfig = {
      id: `model-${Date.now()}`,
      name: "新模型",
      provider: "openai",
      apiKey: "",
      model: "gpt-4-turbo",
      isDefault: false,
      isEnabled: true,
      supportsMultimodal: true,
      contextLength: 128000,
      temperature: 0.7,
      proxyUrl: "",
      multimodalConfig: {
        maxImageSize: 4096,
        supportedFormats: ["jpeg", "png", "webp"],
        enabled: false
      }
    };
    setModelConfigs([...modelConfigs, newModel]);
    setEditingModel(newModel);
  };

  // 添加新的Embedding模型
  const handleAddEmbedding = () => {
    const newModel: EmbeddingModelConfig = {
      id: `embedding-${Date.now()}`,
      name: "新Embedding模型",
      provider: "openai",
      model: "text-embedding-ada-002",
      dimensions: 1536,
      maxInputLength: 8192,
      isDefault: false,
      apiKey: "",
      baseUrl: ""
    };
    setEmbeddingConfigs([...embeddingConfigs, newModel]);
    setEditingEmbedding(newModel);
  };

  // 删除聊天模型
  const handleDeleteModel = (id: string) => {
    setModelConfigs(modelConfigs.filter(config => config.id !== id));
    if (editingModel?.id === id) {
      setEditingModel(null);
    }
  };

  // 删除Embedding模型
  const handleDeleteEmbedding = (id: string) => {
    setEmbeddingConfigs(embeddingConfigs.filter(config => config.id !== id));
    if (editingEmbedding?.id === id) {
      setEditingEmbedding(null);
    }
  };

  // 选择编辑聊天模型
  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model);
  };

  // 选择编辑Embedding模型
  const handleEditEmbedding = (model: EmbeddingModelConfig) => {
    setEditingEmbedding(model);
  };

  // 更新聊天模型
  const handleUpdateModel = (updatedModel: ModelConfig) => {
    // 如果设置为默认模型，将其他模型设为非默认
    let updatedConfigs = [...modelConfigs];
    if (updatedModel.isDefault) {
      updatedConfigs = updatedConfigs.map(config => ({
        ...config,
        isDefault: config.id === updatedModel.id
      }));
    }
    
    // 更新模型配置
    setModelConfigs(
      updatedConfigs.map(config => 
        config.id === updatedModel.id ? updatedModel : config
      )
    );
  };

  // 更新Embedding模型
  const handleUpdateEmbedding = (updatedModel: EmbeddingModelConfig) => {
    // 如果设置为默认模型，将其他模型设为非默认
    let updatedConfigs = [...embeddingConfigs];
    if (updatedModel.isDefault) {
      updatedConfigs = updatedConfigs.map(config => ({
        ...config,
        isDefault: config.id === updatedModel.id
      }));
    }
    
    // 更新模型配置
    setEmbeddingConfigs(
      updatedConfigs.map(config => 
        config.id === updatedModel.id ? updatedModel : config
      )
    );
  };

  // 格式化API端点URL
  const formatApiUrl = (url: string): string => {
    // 移除可能的@前缀
    let formattedUrl = url.trim();
    if (formattedUrl.startsWith('@')) {
      formattedUrl = formattedUrl.substring(1);
    }
    
    // 确保URL有正确的协议
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    // 移除URL末尾可能的斜杠
    if (formattedUrl.endsWith('/')) {
      formattedUrl = formattedUrl.slice(0, -1);
    }
    
    return formattedUrl;
  };

  // 更改聊天模型属性
  const handleModelChange = (field: string, value: string | boolean | number | object) => {
    if (!editingModel) return;
    
    // 格式化API端点URL
    if (field === "baseUrl" && typeof value === 'string') {
      value = formatApiUrl(value);
    }
    
    const updated = {
      ...editingModel,
      [field]: value
    };
    
    setEditingModel(updated);
    handleUpdateModel(updated);
  };

  // 更改Embedding模型属性
  const handleEmbeddingChange = (field: string, value: string | boolean | number) => {
    if (!editingEmbedding) return;
    
    const updated = {
      ...editingEmbedding,
      [field]: value
    };
    
    setEditingEmbedding(updated);
    handleUpdateEmbedding(updated);
  };

  // 保存所有模型配置
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 保存聊天模型配置
      aiService.updateModelConfigs(modelConfigs);
      
      // 保存Embedding模型配置
      aiService.updateEmbeddingConfigs(embeddingConfigs);
      
      // 显示成功消息
      toast({
        title: "模型配置保存成功",
        description: "所有模型配置已成功保存到服务器。"
      });
      
      // 保存成功后跳转到模型列表页面
      router.push("/settings/models");
    } catch (error) {
      console.error("Failed to save model configurations:", error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: `保存配置失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取聊天模型提供商信息
  const getProviderByID = (id: string) => {
    return modelProviders.find(provider => provider.id === id) || modelProviders[0];
  };

  // 测试聊天模型API连接
  const handleTestConnection = async () => {
    if (!editingModel) return;
    
    console.log('测试API连接:', {
      provider: editingModel.provider,
      baseUrl: editingModel.baseUrl,
      apiKey: editingModel.apiKey ? '已设置' : '未设置'
    });
    
    setTestStatus({id: editingModel.id, status: 'loading'});
    try {
      // 使用AIService测试连接
      const result = await aiService.testModelConnection(editingModel);
      console.log('API连接测试结果:', result);
      
      if (result.success) {
        setTestStatus({
          id: editingModel.id, 
          status: 'success', 
          message: result.message,
          availableModels: result.availableModels
        });

        // 如果是硅基流动API并且返回了可用模型列表
        if (editingModel.provider === 'siliconflow' && result.availableModels?.length) {
          setAvailableModelList(result.availableModels);
          
          // 设置闪动效果
          const pulsating: {[key: string]: boolean} = {};
          result.availableModels.forEach(model => {
            pulsating[model] = true;
          });
          setPulsatingModels(pulsating);
        }
      } else {
        setTestStatus({
          id: editingModel.id, 
          status: 'error', 
          message: result.message
        });
      }
    } catch (error) {
      console.error('测试连接时出错:', error);
      setTestStatus({
        id: editingModel.id, 
        status: 'error', 
        message: `测试出错: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  // 测试Embedding模型API连接
  const handleTestEmbeddingConnection = async () => {
    if (!editingEmbedding) return;
    
    setTestStatus({id: editingEmbedding.id, status: 'loading'});
    try {
      // 使用AIService测试连接
      const result = await aiService.testEmbeddingConnection(editingEmbedding);
      
      if (result.success) {
        setTestStatus({
          id: editingEmbedding.id, 
          status: 'success', 
          message: result.message
        });
      } else {
        setTestStatus({
          id: editingEmbedding.id, 
          status: 'error', 
          message: result.message
        });
      }
    } catch (error) {
      setTestStatus({
        id: editingEmbedding.id, 
        status: 'error', 
        message: `测试出错: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  // 动态加载当前提供商的可用模型列表
  const getAvailableModels = () => {
    if (editingModel?.provider === 'siliconflow' && availableModelList.length > 0) {
      // 对硅基流动模型进行分类展示
      return availableModelList;
    }
    return getProviderByID(editingModel?.provider || 'openai').defaultModels;
  };

  // 获取模型提供商名称
  const getModelProviderName = (modelId: string): string => {
    if (modelId.startsWith('deepseek')) {
      return 'DeepSeek';
    } else if (modelId.startsWith('llama')) {
      return 'Llama';
    } else if (modelId.startsWith('qwen')) {
      return 'Qwen';
    } else if (modelId.startsWith('yi')) {
      return 'Yi';
    } else if (modelId.startsWith('mistral') || modelId.startsWith('mixtral')) {
      return 'Mistral';
    } else if (modelId.startsWith('codellama')) {
      return 'CodeLlama';
    } else {
      return '其他';
    }
  };

  // 对模型列表进行分组
  const getGroupedModels = () => {
    if (editingModel?.provider !== 'siliconflow' || availableModelList.length === 0) {
      return null;
    }
    
    // 按提供商分组
    const groupedModels: Record<string, string[]> = {};
    availableModelList.forEach(model => {
      const provider = getModelProviderName(model);
      if (!groupedModels[provider]) {
        groupedModels[provider] = [];
      }
      groupedModels[provider].push(model);
    });
    
    return groupedModels;
  };

  // 闪动的绿点CSS样式
  const pulsatingDotStyle = {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981', // 绿色
    marginRight: '8px',
    animation: 'pulse 1.5s infinite',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI模型设置</CardTitle>
        <CardDescription>
          配置连接到不同AI模型的API设置，支持聊天模型和Embedding模型
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="models">聊天模型</TabsTrigger>
            <TabsTrigger value="embeddings">Embedding模型</TabsTrigger>
            <TabsTrigger value="advanced">高级设置</TabsTrigger>
          </TabsList>
          
          {/* 聊天模型配置选项卡 */}
          <TabsContent value="models" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">已配置的聊天模型</h3>
              <Button variant="outline" size="sm" onClick={handleAddModel}>
                <Plus className="h-4 w-4 mr-2" />
                添加模型
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 border rounded-md p-4">
                <ul className="space-y-2">
                  {modelConfigs.map(config => (
                    <li 
                      key={config.id}
                      className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                        editingModel?.id === config.id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => handleEditModel(config)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{config.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {getProviderByID(config.provider).name} · {config.model}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {config.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">默认</span>
                        )}
                        {!config.isEnabled && (
                          <span className="px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">已禁用</span>
                        )}
                        {config.supportsMultimodal && config.multimodalConfig?.enabled && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-600 rounded-full">多模态</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModel(config.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                  {modelConfigs.length === 0 && (
                    <li className="p-4 text-center text-muted-foreground">
                      没有配置的模型，请点击"添加模型"按钮
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="md:col-span-2 border rounded-md p-4">
                {editingModel ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="modelName">模型名称</Label>
                        <Input 
                          id="modelName"
                          value={editingModel.name}
                          onChange={(e) => handleModelChange("name", e.target.value)}
                          placeholder="输入便于识别的名称"
                        />
                        <p className="text-xs text-muted-foreground">自定义名称，便于在系统中识别</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="modelProvider">模型提供商</Label>
                        <Select 
                          value={editingModel.provider}
                          onValueChange={(value) => handleModelChange("provider", value)}
                        >
                          <SelectTrigger id="modelProvider">
                            <SelectValue placeholder="选择模型提供商" />
                          </SelectTrigger>
                          <SelectContent>
                            {modelProviders.map(provider => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">选择模型供应商平台</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="apiKey">API密钥</Label>
                      <Input 
                        id="apiKey"
                        type="password"
                        value={editingModel.apiKey}
                        onChange={(e) => handleModelChange("apiKey", e.target.value)}
                        placeholder="输入API密钥"
                      />
                      <p className="text-xs text-muted-foreground">
                        从提供商获取的API密钥，用于身份验证。系统内加密存储
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="baseUrl">API端点URL</Label>
                        <Input 
                          id="baseUrl"
                          value={editingModel.baseUrl || getProviderByID(editingModel.provider).url}
                          onChange={(e) => handleModelChange("baseUrl", e.target.value)}
                          placeholder="例如：https://api.openai.com/v1"
                        />
                        <p className="text-xs text-muted-foreground">
                          API的基础URL，使用默认值或指定自定义端点
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="proxyUrl">代理服务器 (可选)</Label>
                        <Input 
                          id="proxyUrl"
                          value={editingModel.proxyUrl || ""}
                          onChange={(e) => handleModelChange("proxyUrl", e.target.value)}
                          placeholder="例如：http://your-proxy:8080"
                        />
                        <p className="text-xs text-muted-foreground">
                          如需通过代理访问API，请设置代理服务器地址
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="modelVersion">模型版本</Label>
                        <Select 
                          value={editingModel.model}
                          onValueChange={(value) => handleModelChange("model", value)}
                        >
                          <SelectTrigger id="modelVersion">
                            <SelectValue placeholder="选择模型版本" />
                          </SelectTrigger>
                          <SelectContent>
                            {editingModel?.provider === 'siliconflow' && availableModelList.length > 0 ? (
                              Object.entries(getGroupedModels() || {}).map(([provider, models]) => (
                                <SelectGroup key={provider}>
                                  <SelectLabel className="text-xs font-bold px-2 py-1 bg-muted mt-1">
                                    {provider}
                                  </SelectLabel>
                                  {models.map(model => (
                                    <SelectItem key={model} value={model}>
                                      <div className="flex items-center">
                                        {pulsatingModels[model] && (
                                          <span style={pulsatingDotStyle} />
                                        )}
                                        {model}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))
                            ) : (
                              getAvailableModels().map(model => (
                                <SelectItem key={model} value={model}>
                                  <div className="flex items-center">
                                    {editingModel?.provider === 'siliconflow' && pulsatingModels[model] && (
                                      <span style={pulsatingDotStyle} />
                                    )}
                                    {model}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          选择特定的模型版本，不同版本具有不同的能力和价格
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="contextLength">上下文长度</Label>
                        <Select 
                          value={String(editingModel.contextLength)}
                          onValueChange={(value) => handleModelChange("contextLength", parseInt(value))}
                        >
                          <SelectTrigger id="contextLength">
                            <SelectValue placeholder="选择上下文长度" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4000">4K tokens</SelectItem>
                            <SelectItem value="8000">8K tokens</SelectItem>
                            <SelectItem value="16000">16K tokens</SelectItem>
                            <SelectItem value="32000">32K tokens</SelectItem>
                            <SelectItem value="64000">64K tokens</SelectItem>
                            <SelectItem value="128000">128K tokens</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          模型能处理的最大上下文长度，较长的上下文可能增加成本
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="temperature">Temperature (温度)</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            id="temperature"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={editingModel.temperature}
                            onChange={(e) => handleModelChange("temperature", parseFloat(e.target.value))}
                          />
                          <span className="w-10 text-center">
                            {editingModel.temperature.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          控制输出的随机性：低值更确定，高值更创造性
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="testConnection">连接测试</Label>
                        <Button 
                          id="testConnection"
                          variant="outline" 
                          onClick={handleTestConnection}
                          disabled={testStatus.status === 'loading' || !editingModel.apiKey}
                          className="flex items-center gap-2"
                        >
                          {testStatus.status === 'loading' ? 
                            "测试中..." : 
                            "测试API连接"
                          }
                        </Button>
                        {testStatus.id === editingModel.id && testStatus.status !== 'idle' && (
                          <div className={`text-xs mt-1 ${
                            testStatus.status === 'success' ? 'text-green-600' : 
                            testStatus.status === 'error' ? 'text-red-600' : ''
                          }`}>
                            <p className="font-medium">{testStatus.message}</p>
                            {testStatus.status === 'success' && editingModel.provider === 'siliconflow' && testStatus.availableModels && (
                              <p className="mt-1">
                                已加载 {testStatus.availableModels.length} 个可用模型
                              </p>
                            )}
                            {testStatus.status === 'error' && (
                              <div className="mt-1 space-y-1">
                                <p className="text-sm">可能的解决方案:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>检查API密钥是否正确</li>
                                  <li>确认API端点URL格式正确（不需要@前缀）</li>
                                  <li>API端点正确格式: https://api.siliconflow.cn/v1</li>
                                  <li>检查网络连接是否正常</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isEnabled" className="flex-1">启用此模型</Label>
                        <Switch 
                          id="isEnabled" 
                          checked={editingModel.isEnabled}
                          onCheckedChange={(checked: boolean) => handleModelChange("isEnabled", checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        启用或禁用此模型，禁用后不会被系统使用
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isDefault" className="flex-1">设为默认模型</Label>
                        <Switch 
                          id="isDefault" 
                          checked={editingModel.isDefault}
                          onCheckedChange={(checked: boolean) => handleModelChange("isDefault", checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        设为默认后，系统将优先使用该模型
                      </p>
                    </div>
                    
                    {getProviderByID(editingModel.provider).supportsMultimodal && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="supportsMultimodal" className="flex-1">启用多模态支持</Label>
                          <Switch 
                            id="supportsMultimodal" 
                            checked={editingModel.multimodalConfig?.enabled || false}
                            onCheckedChange={(checked: boolean) => {
                              handleModelChange("multimodalConfig", {
                                ...(editingModel.multimodalConfig || {
                                  maxImageSize: 4096,
                                  supportedFormats: ["jpeg", "png", "webp"]
                                }),
                                enabled: checked
                              });
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          启用后，系统将能够处理图像等多模态输入
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center text-muted-foreground">
                      <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">选择模型</h3>
                      <p className="text-sm mt-1">从左侧选择一个模型进行编辑，或添加新模型</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Embedding模型配置选项卡 */}
          <TabsContent value="embeddings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">已配置的Embedding模型</h3>
              <Button variant="outline" size="sm" onClick={handleAddEmbedding}>
                <Plus className="h-4 w-4 mr-2" />
                添加Embedding模型
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 border rounded-md p-4">
                <ul className="space-y-2">
                  {embeddingConfigs.map(config => (
                    <li 
                      key={config.id}
                      className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                        editingEmbedding?.id === config.id 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => handleEditEmbedding(config)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{config.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {config.provider} · {config.dimensions}维
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {config.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">默认</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmbedding(config.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                  {embeddingConfigs.length === 0 && (
                    <li className="p-4 text-center text-muted-foreground">
                      没有配置的Embedding模型，请点击"添加Embedding模型"按钮
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="md:col-span-2 border rounded-md p-4">
                {editingEmbedding ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="embeddingName">模型名称</Label>
                        <Input 
                          id="embeddingName"
                          value={editingEmbedding.name}
                          onChange={(e) => handleEmbeddingChange("name", e.target.value)}
                          placeholder="输入便于识别的名称"
                        />
                        <p className="text-xs text-muted-foreground">自定义名称，便于在系统中识别</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="embeddingProvider">模型提供商</Label>
                        <Select 
                          value={editingEmbedding.provider}
                          onValueChange={(value) => handleEmbeddingChange("provider", value)}
                        >
                          <SelectTrigger id="embeddingProvider">
                            <SelectValue placeholder="选择模型提供商" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="huggingface">HuggingFace</SelectItem>
                            <SelectItem value="custom">自定义</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">选择Embedding模型供应商</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="embeddingModel">模型名称/路径</Label>
                        <Input 
                          id="embeddingModel"
                          value={editingEmbedding.model}
                          onChange={(e) => handleEmbeddingChange("model", e.target.value)}
                          placeholder="例如：text-embedding-ada-002"
                        />
                        <p className="text-xs text-muted-foreground">
                          模型的标识符或路径，例如OpenAI的text-embedding-ada-002
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="embeddingDimensions">向量维度</Label>
                        <Input 
                          id="embeddingDimensions"
                          type="number"
                          value={editingEmbedding.dimensions}
                          onChange={(e) => handleEmbeddingChange("dimensions", parseInt(e.target.value))}
                          placeholder="例如：1536"
                        />
                        <p className="text-xs text-muted-foreground">
                          Embedding向量的维度大小，例如OpenAI Ada是1536维
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="embeddingApiKey">API密钥</Label>
                      <Input 
                        id="embeddingApiKey"
                        type="password"
                        value={editingEmbedding.apiKey || ""}
                        onChange={(e) => handleEmbeddingChange("apiKey", e.target.value)}
                        placeholder="输入API密钥"
                      />
                      <p className="text-xs text-muted-foreground">
                        从提供商获取的API密钥，用于身份验证
                      </p>
                    </div>
                    
                    {(editingEmbedding.provider === 'custom' || editingEmbedding.provider === 'huggingface') && (
                      <div className="grid gap-2">
                        <Label htmlFor="embeddingBaseUrl">API端点URL</Label>
                        <Input 
                          id="embeddingBaseUrl"
                          value={editingEmbedding.baseUrl || ""}
                          onChange={(e) => handleEmbeddingChange("baseUrl", e.target.value)}
                          placeholder="例如：https://api.example.com/v1/embeddings"
                        />
                        <p className="text-xs text-muted-foreground">
                          自定义API的基础URL，或HuggingFace端点地址
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="embeddingMaxInputLength">最大输入长度</Label>
                        <Input 
                          id="embeddingMaxInputLength"
                          type="number"
                          value={editingEmbedding.maxInputLength}
                          onChange={(e) => handleEmbeddingChange("maxInputLength", parseInt(e.target.value))}
                          placeholder="例如：8192"
                        />
                        <p className="text-xs text-muted-foreground">
                          模型支持的最大输入文本长度（通常以token计算）
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="testEmbeddingConnection">连接测试</Label>
                          <Button 
                            id="testEmbeddingConnection"
                            variant="outline" 
                            onClick={handleTestEmbeddingConnection}
                            disabled={testStatus.status === 'loading' || !editingEmbedding.apiKey}
                            className="flex items-center gap-2"
                          >
                            {testStatus.status === 'loading' ? 
                              "测试中..." : 
                              "测试API连接"
                            }
                          </Button>
                          {testStatus.id === editingEmbedding.id && testStatus.status !== 'idle' && (
                            <div className={`text-xs mt-1 ${
                              testStatus.status === 'success' ? 'text-green-600' : 
                              testStatus.status === 'error' ? 'text-red-600' : ''
                            }`}>
                              <p>{testStatus.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="embeddingIsDefault" className="flex-1">设为默认Embedding模型</Label>
                        <Switch 
                          id="embeddingIsDefault" 
                          checked={editingEmbedding.isDefault}
                          onCheckedChange={(checked: boolean) => handleEmbeddingChange("isDefault", checked)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        设为默认后，知识库创建和检索将使用此模型
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="text-center text-muted-foreground">
                      <Database className="h-10 w-10 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">选择Embedding模型</h3>
                      <p className="text-sm mt-1">从左侧选择一个模型进行编辑，或添加新模型</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* 保留原有的高级设置选项卡 */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>多模态配置</CardTitle>
                <CardDescription>
                  配置支持多模态（如图像处理）能力的参数
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingModel && editingModel.multimodalConfig?.enabled ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="maxImageSize">最大图像尺寸 (像素)</Label>
                        <Select 
                          value={String(editingModel.multimodalConfig?.maxImageSize || 4096)}
                          onValueChange={(value) => {
                            handleModelChange("multimodalConfig", {
                              ...(editingModel.multimodalConfig || {
                                enabled: true,
                                supportedFormats: ["jpeg", "png", "webp"]
                              }),
                              maxImageSize: parseInt(value)
                            });
                          }}
                        >
                          <SelectTrigger id="maxImageSize">
                            <SelectValue placeholder="选择最大尺寸" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1024">1024 x 1024</SelectItem>
                            <SelectItem value="2048">2048 x 2048</SelectItem>
                            <SelectItem value="4096">4096 x 4096</SelectItem>
                            <SelectItem value="8192">8192 x 8192</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          支持处理的最大图像尺寸，较大尺寸可能影响性能和成本
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label>支持的图像格式</Label>
                        <div className="flex flex-wrap gap-2">
                          {["jpeg", "png", "webp", "gif", "avif", "tiff"].map(format => {
                            const isSelected = editingModel.multimodalConfig?.supportedFormats?.includes(format) || false;
                            return (
                              <Button
                                key={format}
                                variant={isSelected ? "default" : "outline"}
                                className="h-8 rounded-full"
                                size="sm"
                                onClick={() => {
                                  const currentFormats = editingModel.multimodalConfig?.supportedFormats || [];
                                  const newFormats = isSelected 
                                    ? currentFormats.filter(f => f !== format)
                                    : [...currentFormats, format];
                                  
                                  handleModelChange("multimodalConfig", {
                                    ...(editingModel.multimodalConfig || {
                                      enabled: true,
                                      maxImageSize: 4096
                                    }),
                                    supportedFormats: newFormats
                                  });
                                }}
                              >
                                {format.toUpperCase()}
                              </Button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          选择系统支持处理的图像格式
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">未启用多模态支持</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      请先在「模型配置」标签页中选择一个模型并启用多模态支持
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>系统行为设置</CardTitle>
                <CardDescription>
                  配置AI模型调用的全局行为和故障处理策略
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableFailover" className="flex-1">启用模型故障转移</Label>
                    <Switch 
                      id="enableFailover" 
                      checked={true}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    当默认模型不可用或出错时，自动尝试使用其他可用模型
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="retryOnFailure" className="flex-1">失败自动重试</Label>
                    <Switch 
                      id="retryOnFailure" 
                      checked={true}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    API调用失败时自动尝试重试，最多3次
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="requestTimeout">请求超时 (秒)</Label>
                  <Select defaultValue="90">
                    <SelectTrigger id="requestTimeout">
                      <SelectValue placeholder="选择超时时间" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30秒</SelectItem>
                      <SelectItem value="60">60秒</SelectItem>
                      <SelectItem value="90">90秒</SelectItem>
                      <SelectItem value="120">120秒</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    模型API请求的最大等待时间，超时将自动取消
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? "保存中..." : <>
            <Save className="h-4 w-4" />
            保存设置
          </>}
        </Button>
      </CardFooter>
    </Card>
  );
} 