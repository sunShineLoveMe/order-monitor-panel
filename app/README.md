# 订单图片智能识别功能问题排查指南

## 当前问题

在使用订单图片智能识别功能时，可能会遇到以下错误：

```
错误: Error calling SiliconFlow API: 400 Bad Request - {"code":20012,"message":"Model does not exist. Please check it carefully.","data":null}
```

## 模型不存在错误解决方案

错误代码20012表示所请求的模型不存在。以下是解决方案：

### 1. 检查模型命名

硅基流动平台要求模型名称必须精确匹配，确保使用以下名称：

- 模型名称必须使用全小写: `qwen2-vl-72b-instruct` 
- 不要使用: `Qwen2-VL-72B-Instruct` (这是错误的格式)

### 2. 检查硅基流动账户权限

该错误也可能由以下原因导致：

1. **API密钥无效或过期** - 请确保您的API密钥正确且有效
2. **账户未获授权访问该模型** - 联系硅基流动客服确认您的账户是否有权限使用该模型
3. **模型名称已变更** - 有时模型名称可能会更改，请查看硅基流动最新文档

### 3. 尝试其他可用模型

如果特定模型不可用，可以尝试使用以下替代模型：

```
# 替代选项
qwen-vl-plus
qwen-vl-max
```

## 解决方案（环境变量配置）

请确保在`.env.local`文件中使用正确的配置：

```
# 硅基流动模型配置
DEFAULT_MODEL_PROVIDER=siliconflow
DEFAULT_MODEL=qwen2-vl-72b-instruct
DEFAULT_MODEL_ID=siliconflow-qwen2-vl
DEFAULT_MODEL_NAME=Qwen2 VL 多模态模型
SILICONFLOW_API_KEY=sk-your-api-key-here
SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn/v1
```

3. 将`sk-your-api-key-here`替换为您的实际API密钥
4. 保存文件并重启服务器：`npm run dev`

## 其他多模态模型选项

如果硅基流动模型仍然无法正常工作，您可以尝试其他支持的多模态模型：

1. **OpenAI**: 使用GPT-4 Vision模型
2. **Claude**: 使用Claude 3 Opus/Sonnet模型
3. **阿里云**: 使用通义千问VL模型

## 技术支持

如需进一步的技术支持，请联系系统管理员或技术支持团队。 
