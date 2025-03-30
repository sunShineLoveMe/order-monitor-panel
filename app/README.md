# 订单图片智能识别功能问题排查指南

## 当前问题

在使用订单图片智能识别功能时，可能会遇到以下错误：

```
扫描失败: TypeError: fetch failed
```

这通常是由于模型配置问题导致的，特别是当使用硅基流动的Qwen2-VL-72B-Instruct等多模态模型时。

## 解决方案

### 1. 通过环境变量配置（推荐）

最有效的解决方法是直接在服务器端通过环境变量配置模型：

1. 在项目根目录找到（或创建）`.env.local`文件
2. 添加以下配置：

```
# 硅基流动模型配置
DEFAULT_MODEL_PROVIDER=siliconflow
DEFAULT_MODEL=Qwen2-VL-72B-Instruct
DEFAULT_MODEL_ID=siliconflow-qwen2-vl
DEFAULT_MODEL_NAME=Qwen2 VL 多模态模型
SILICONFLOW_API_KEY=sk-your-api-key-here
SILICONFLOW_API_BASE_URL=https://api.siliconflow.cn/v1
```

3. 将`sk-your-api-key-here`替换为您的实际API密钥
4. 保存文件并重启服务器：`npm run dev`

这种方法能够确保服务器端API直接使用正确的模型配置，不依赖于浏览器端的配置。

### 2. 检查模型配置（浏览器端）

如果您无法修改服务器环境变量，可以尝试通过界面配置：

1. 点击导航菜单中的"设置" -> "模型管理"
2. 在模型管理页面右上角，点击"测试模型配置"按钮
3. 或者直接访问：`/settings/models/test`

### 3. 硅基流动模型正确配置步骤

如果您使用的是硅基流动的Qwen2-VL-72B-Instruct模型，请确保以下配置正确：

1. **提供商(Provider)**: 设置为 `siliconflow`（非常重要，不要设置为其他值）
2. **API密钥**: 确保格式正确（通常以sk-开头）
3. **API端点**: 设置为 `https://api.siliconflow.cn/v1`
4. **多模态支持**: 必须启用
5. **模型名称**: 设置为正确的 `Qwen2-VL-72B-Instruct`

### 4. 常见错误原因

- API端点URL格式不正确
- API密钥格式错误或无效
- 模型访问受限或需要特定权限
- 网络连接问题或防火墙设置
- 服务器端与客户端配置不匹配

### 5. 验证方法

配置完成后，可以在测试页面点击"测试模型配置"按钮，系统将验证您的配置是否正确。

## 其他多模态模型选项

如果硅基流动模型仍然无法正常工作，您可以尝试其他支持的多模态模型：

1. **OpenAI**: 使用GPT-4 Vision模型
2. **Claude**: 使用Claude 3 Opus/Sonnet模型
3. **阿里云**: 使用通义千问VL模型

## 技术支持

如需进一步的技术支持，请联系系统管理员或技术支持团队。 