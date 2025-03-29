"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save, AlertCircle } from "lucide-react";

// 定义模型类型和提供商接口
interface ModelProvider {
  id: string;
  name: string;
  url: string;
  defaultModels: string[];
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  isDefault: boolean;
  isEnabled: boolean;
  supportsMultimodal: boolean;
  contextLength: number;
  temperature: number;
}

// 预定义的模型提供商
const modelProviders: ModelProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://api.openai.com/v1",
    defaultModels: ["gpt-4-turbo", "gpt-4-vision", "gpt-3.5-turbo"],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    url: "https://api.anthropic.com",
    defaultModels: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  },
  {
    id: "qwen",
    name: "阿里云通义千问",
    url: "https://dashscope.aliyuncs.com/api/v1",
    defaultModels: ["qwen-turbo", "qwen-plus", "qwen-max"],
  },
  {
    id: "baidu",
    name: "百度文心一言",
    url: "https://aip.baidubce.com/rpc/2.0/ai_custom",
    defaultModels: ["ernie-bot-4", "ernie-bot-turbo", "ernie-bot"],
  },
  {
    id: "custom",
    name: "自定义模型",
    url: "",
    defaultModels: ["custom-model"],
  },
];

export default function ModelSettingsManager() {
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([
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
    },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("models");
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);

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
    };
    setModelConfigs([...modelConfigs, newModel]);
    setEditingModel(newModel);
  };

  const handleDeleteModel = (id: string) => {
    setModelConfigs(modelConfigs.filter(config => config.id !== id));
    if (editingModel?.id === id) {
      setEditingModel(null);
    }
  };

  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model);
  };

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

  const handleModelChange = (field: string, value: string | boolean | number) => {
    if (!editingModel) return;
    
    const updated = {
      ...editingModel,
      [field]: value
    };
    
    setEditingModel(updated);
    handleUpdateModel(updated);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 模拟保存设置的API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Model configurations saved:", modelConfigs);
      // 这里应该有一个真实的API调用来保存模型配置
    } catch (error) {
      console.error("Failed to save model configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderByID = (id: string) => {
    return modelProviders.find(provider => provider.id === id) || modelProviders[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI模型设置</CardTitle>
        <CardDescription>
          配置连接到不同AI模型的API设置，支持OpenAI、Claude、通义千问等多模型
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="models">模型配置</TabsTrigger>
            <TabsTrigger value="advanced">高级设置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">已配置的模型</h3>
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
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="modelProvider">模型提供商</Label>
                        <Select 
                          value={editingModel.provider}
                          onValueChange={(value) => handleModelChange("provider", value)}
                        >
                          <SelectTrigger id="modelProvider">
                            <SelectValue placeholder="选择提供商" />
                          </SelectTrigger>
                          <SelectContent>
                            {modelProviders.map(provider => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API密钥</Label>
                      <Input 
                        id="apiKey"
                        type="password"
                        value={editingModel.apiKey}
                        onChange={(e) => handleModelChange("apiKey", e.target.value)}
                      />
                    </div>
                    
                    {editingModel.provider === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="baseUrl">API基础URL</Label>
                        <Input 
                          id="baseUrl"
                          type="text"
                          value={editingModel.baseUrl || ''}
                          onChange={(e) => handleModelChange("baseUrl", e.target.value)}
                          placeholder="https://your-api-endpoint.com"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="modelName">模型</Label>
                        <Select 
                          value={editingModel.model}
                          onValueChange={(value) => handleModelChange("model", value)}
                        >
                          <SelectTrigger id="modelName">
                            <SelectValue placeholder="选择模型" />
                          </SelectTrigger>
                          <SelectContent>
                            {getProviderByID(editingModel.provider).defaultModels.map(model => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">自定义...</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contextLength">上下文长度</Label>
                        <Select 
                          value={editingModel.contextLength.toString()}
                          onValueChange={(value) => handleModelChange("contextLength", parseInt(value))}
                        >
                          <SelectTrigger id="contextLength">
                            <SelectValue placeholder="选择上下文长度" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8000">8K</SelectItem>
                            <SelectItem value="16000">16K</SelectItem>
                            <SelectItem value="32000">32K</SelectItem>
                            <SelectItem value="128000">128K</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="temperature">Temperature (创造性)</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            id="temperature"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={editingModel.temperature}
                            onChange={(e) => handleModelChange("temperature", parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-10 text-center">{editingModel.temperature}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="supportsMultimodal" className="flex-1">支持多模态输入</Label>
                        <Switch 
                          id="supportsMultimodal" 
                          checked={editingModel.supportsMultimodal}
                          onCheckedChange={(checked: boolean) => handleModelChange("supportsMultimodal", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isDefault" className="flex-1">设为默认模型</Label>
                        <Switch 
                          id="isDefault" 
                          checked={editingModel.isDefault}
                          onCheckedChange={(checked: boolean) => handleModelChange("isDefault", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isEnabled" className="flex-1">启用此模型</Label>
                        <Switch 
                          id="isEnabled" 
                          checked={editingModel.isEnabled}
                          onCheckedChange={(checked: boolean) => handleModelChange("isEnabled", checked)}
                        />
                      </div>
                    </div>
                    
                    {!editingModel.apiKey && (
                      <div className="flex items-center p-3 text-sm bg-yellow-50 border border-yellow-200 rounded-md">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-yellow-700">请提供API密钥以使用此模型</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    选择一个模型进行编辑，或添加一个新模型
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="requestTimeout">请求超时 (秒)</Label>
                <Input 
                  id="requestTimeout"
                  type="number"
                  defaultValue="60"
                  min="10"
                  max="300"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="maxTokens">最大生成Token数</Label>
                <Input 
                  id="maxTokens"
                  type="number"
                  defaultValue="4000"
                  min="100"
                  max="8000"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableFallback" className="flex-1">
                  启用模型故障转移
                  <p className="text-xs text-muted-foreground mt-1">
                    当主要模型不可用时自动切换到备用模型
                  </p>
                </Label>
                <Switch 
                  id="enableFallback" 
                  defaultChecked={true}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableCache" className="flex-1">
                  启用模型响应缓存
                  <p className="text-xs text-muted-foreground mt-1">
                    缓存相同输入的模型响应以减少API调用
                  </p>
                </Label>
                <Switch 
                  id="enableCache" 
                  defaultChecked={true}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">重置</Button>
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