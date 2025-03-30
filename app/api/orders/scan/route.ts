import { NextRequest, NextResponse } from "next/server";
import { ModelConfig } from "@/lib/services/ai";

// 从localStorage获取已配置的多模态模型
async function getMultimodalModel(): Promise<ModelConfig | null> {
  try {
    // 从环境变量中检查是否有配置的硅基流动模型信息
    if (
      process.env.DEFAULT_MODEL_PROVIDER === "siliconflow" && 
      process.env.SILICONFLOW_API_KEY
    ) {
      console.log("使用环境变量中的硅基流动模型配置");
      return {
        id: process.env.DEFAULT_MODEL_ID || "siliconflow-model",
        name: process.env.DEFAULT_MODEL_NAME || "Qwen2-VL-72B-Instruct",
        provider: "siliconflow",
        apiKey: process.env.SILICONFLOW_API_KEY || "",
        model: process.env.DEFAULT_MODEL || "Qwen2-VL-72B-Instruct",
        baseUrl: process.env.SILICONFLOW_API_BASE_URL || "https://api.siliconflow.cn/v1",
        isDefault: true,
        isEnabled: true,
        supportsMultimodal: true,
        contextLength: 128000,
        temperature: 0.7,
        multimodalConfig: {
          maxImageSize: 4096,
          supportedFormats: ["jpeg", "png", "webp"],
          enabled: true
        }
      };
    }
    
    // 如果没有配置硅基流动模型，则尝试使用OpenAI模型
    console.log("使用OpenAI默认模型配置");
    return {
      id: process.env.DEFAULT_MODEL_ID || "default-model",
      name: process.env.DEFAULT_MODEL_NAME || "GPT-4 Vision",
      provider: process.env.DEFAULT_MODEL_PROVIDER || "openai",
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.DEFAULT_MODEL || "gpt-4-vision-preview",
      baseUrl: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
      isDefault: true,
      isEnabled: true,
      supportsMultimodal: true,
      contextLength: 128000,
      temperature: 0.7,
      multimodalConfig: {
        maxImageSize: 4096,
        supportedFormats: ["jpeg", "png", "webp"],
        enabled: true
      }
    };
  } catch (error) {
    console.error("Failed to get multimodal model:", error);
    return null;
  }
}

// 调用OpenAI的多模态API分析图片
async function analyzeImageWithOpenAI(
  imageBase64: string,
  modelConfig: ModelConfig
): Promise<any> {
  const prompt = `
    你是一个专业的订单信息提取专家。请仔细分析这张订单图片，提取所有关键信息，包括：
    
    1. 订单编号
    2. 订单日期
    3. 供应商信息
    4. 客户信息 (名称、地址、联系人等)
    5. 商品明细 (描述、数量、单价、总金额)
    6. 总金额
    7. 付款条款
    8. 备注或其他重要信息
    
    请以JSON格式返回结果，包含以下字段：
    {
      "orderNumber": "订单编号",
      "date": "YYYY-MM-DD格式的日期",
      "supplier": "供应商名称",
      "total": 数字类型的总金额,
      "currency": "货币类型，如CNY、USD等",
      "items": [
        {
          "description": "商品描述",
          "quantity": 数量,
          "unitPrice": 单价,
          "amount": 金额
        }
      ],
      "customer": {
        "name": "客户名称",
        "address": "客户地址",
        "contactPerson": "联系人",
        "phone": "电话",
        "email": "邮箱"
      },
      "paymentTerms": "付款条款",
      "notes": "备注",
      "confidence": 0-100之间的数字表示识别可信度,
      "rawText": "从图片中提取的原始文本"
    }
    
    注意：确保JSON格式正确，所有金额必须是数字类型而非字符串。如果某些信息无法识别，相应字段可以为null或空字符串。
  `;

  try {
    const payload = {
      model: modelConfig.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: modelConfig.temperature
    };

    const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${modelConfig.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error calling OpenAI API: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 尝试解析返回的JSON
    try {
      // 提取JSON部分，防止有额外的说明文本
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse API response as JSON:", error);
      return {
        error: "无法解析API响应",
        rawContent: content,
        confidence: 30
      };
    }
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw error;
  }
}

// 调用Claude的多模态API分析图片
async function analyzeImageWithClaude(
  imageBase64: string,
  modelConfig: ModelConfig
): Promise<any> {
  const prompt = `
    你是一个专业的订单信息提取专家。请仔细分析这张订单图片，提取所有关键信息，包括：
    
    1. 订单编号
    2. 订单日期
    3. 供应商信息
    4. 客户信息 (名称、地址、联系人等)
    5. 商品明细 (描述、数量、单价、总金额)
    6. 总金额
    7. 付款条款
    8. 备注或其他重要信息
    
    请以JSON格式返回结果，包含以下字段：
    {
      "orderNumber": "订单编号",
      "date": "YYYY-MM-DD格式的日期",
      "supplier": "供应商名称",
      "total": 数字类型的总金额,
      "currency": "货币类型，如CNY、USD等",
      "items": [
        {
          "description": "商品描述",
          "quantity": 数量,
          "unitPrice": 单价,
          "amount": 金额
        }
      ],
      "customer": {
        "name": "客户名称",
        "address": "客户地址",
        "contactPerson": "联系人",
        "phone": "电话",
        "email": "邮箱"
      },
      "paymentTerms": "付款条款",
      "notes": "备注",
      "confidence": 0-100之间的数字表示识别可信度,
      "rawText": "从图片中提取的原始文本"
    }
    
    注意：确保JSON格式正确，所有金额必须是数字类型而非字符串。如果某些信息无法识别，相应字段可以为null或空字符串。只返回JSON格式，不要添加其他解释。
  `;

  try {
    const payload = {
      model: modelConfig.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: modelConfig.temperature
    };

    const response = await fetch(`${modelConfig.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": modelConfig.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error calling Claude API: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // 尝试解析返回的JSON
    try {
      // 提取JSON部分，防止有额外的说明文本
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse API response as JSON:", error);
      return {
        error: "无法解析API响应",
        rawContent: content,
        confidence: 30
      };
    }
  } catch (error) {
    console.error("Error analyzing image with Claude:", error);
    throw error;
  }
}

// 调用硅基流动的多模态API分析图片
async function analyzeImageWithSiliconFlow(
  imageBase64: string,
  modelConfig: ModelConfig
): Promise<any> {
  const prompt = `
    你是一个专业的订单信息提取专家。请仔细分析这张订单图片，提取所有关键信息，包括：
    
    1. 订单编号
    2. 订单日期
    3. 供应商信息
    4. 客户信息 (名称、地址、联系人等)
    5. 商品明细 (描述、数量、单价、总金额)
    6. 总金额
    7. 付款条款
    8. 备注或其他重要信息
    
    请以JSON格式返回结果，包含以下字段：
    {
      "orderNumber": "订单编号",
      "date": "YYYY-MM-DD格式的日期",
      "supplier": "供应商名称",
      "total": 数字类型的总金额,
      "currency": "货币类型，如CNY、USD等",
      "items": [
        {
          "description": "商品描述",
          "quantity": 数量,
          "unitPrice": 单价,
          "amount": 金额
        }
      ],
      "customer": {
        "name": "客户名称",
        "address": "客户地址",
        "contactPerson": "联系人",
        "phone": "电话",
        "email": "邮箱"
      },
      "paymentTerms": "付款条款",
      "notes": "备注",
      "confidence": 0-100之间的数字表示识别可信度,
      "rawText": "从图片中提取的原始文本"
    }
    
    注意：确保JSON格式正确，所有金额必须是数字类型而非字符串。如果某些信息无法识别，相应字段可以为null或空字符串。只返回JSON格式，不要添加其他解释。
  `;

  try {
    console.log("正在调用硅基流动 API 进行图像分析...");
    console.log(`使用模型: ${modelConfig.model}`);
    console.log(`API 端点: ${modelConfig.baseUrl}`);
    
    // 硅基流动API的payload结构 - 修改为符合Qwen2-VL模型的结构
    const payload = {
      model: modelConfig.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: modelConfig.temperature
    };

    // 确保API端点正确
    const apiEndpoint = (modelConfig.baseUrl || "https://api.siliconflow.cn/v1").endsWith('/') 
      ? `${modelConfig.baseUrl || "https://api.siliconflow.cn/v1"}chat/completions`
      : `${modelConfig.baseUrl || "https://api.siliconflow.cn/v1"}/chat/completions`;

    console.log(`完整API端点: ${apiEndpoint}`);
    
    // 硅基流动API调用
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${modelConfig.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("硅基流动API响应错误:", response.status, errorText);
      throw new Error(`Error calling SiliconFlow API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("SiliconFlow API response:", data);
    
    // 从响应中提取内容，硅基流动API结构与OpenAI类似
    const content = data.choices[0].message.content;

    // 尝试解析返回的JSON
    try {
      // 提取JSON部分，防止有额外的说明文本
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse SiliconFlow API response as JSON:", error);
      return {
        error: "无法解析API响应",
        rawContent: content,
        confidence: 30
      };
    }
  } catch (error) {
    console.error("Error analyzing image with SiliconFlow:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("订单扫描API请求开始处理...");
    
    // 获取配置的多模态模型
    const modelConfig = await getMultimodalModel();
    if (!modelConfig) {
      console.error("未找到可用的多模态模型配置");
      return NextResponse.json(
        { error: "未配置可用的多模态模型" },
        { status: 500 }
      );
    }

    console.log(`使用模型: ${modelConfig.provider}/${modelConfig.model}`);
    
    // 解析multipart/form-data请求
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      console.error("请求中未提供图片文件");
      return NextResponse.json(
        { error: "未提供图片文件" },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!imageFile.type.startsWith("image/")) {
      console.error(`文件类型不正确: ${imageFile.type}`);
      return NextResponse.json(
        { error: "上传的文件不是图片" },
        { status: 400 }
      );
    }

    console.log(`接收到图片: ${imageFile.name}, 大小: ${imageFile.size}字节, 类型: ${imageFile.type}`);
    
    // 读取图片文件并转换为base64
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    console.log(`图片已转换为base64, 长度: ${imageBase64.length}`);

    // 根据模型提供商选择不同的API调用方式
    console.log(`使用模型提供商: ${modelConfig.provider}`);
    let analysisResult;
    
    try {
      if (modelConfig.provider === "openai") {
        console.log("调用OpenAI进行图像分析...");
        analysisResult = await analyzeImageWithOpenAI(imageBase64, modelConfig);
      } else if (modelConfig.provider === "anthropic") {
        console.log("调用Anthropic Claude进行图像分析...");
        analysisResult = await analyzeImageWithClaude(imageBase64, modelConfig);
      } else if (modelConfig.provider === "siliconflow") {
        console.log("调用硅基流动进行图像分析...");
        analysisResult = await analyzeImageWithSiliconFlow(imageBase64, modelConfig);
      } else {
        // 如果需要支持其他提供商，可以在这里扩展
        console.error(`不支持的模型提供商: ${modelConfig.provider}`);
        return NextResponse.json(
          { error: `不支持的模型提供商: ${modelConfig.provider}` },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("API调用过程中发生错误:", error);
      return NextResponse.json(
        { 
          error: error instanceof Error 
            ? `API调用失败: ${error.message}` 
            : "API调用失败",
          provider: modelConfig.provider,
          model: modelConfig.model
        },
        { status: 500 }
      );
    }

    // 为了演示，如果没有真实的API密钥，可以返回模拟数据
    if (!modelConfig.apiKey || modelConfig.apiKey === "your-api-key-here") {
      console.log("使用API密钥为空或默认值，返回模拟数据");
      return NextResponse.json(getMockOrderData());
    }

    console.log("图像分析完成，准备返回结果");
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("处理订单扫描请求时发生错误:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "订单扫描处理失败",
        errorDetails: error instanceof Error ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}

// 用于演示的模拟数据
function getMockOrderData() {
  return {
    "orderNumber": "PO-2023-0458",
    "date": "2023-11-15",
    "supplier": "智能电子科技有限公司",
    "total": 28600,
    "currency": "CNY",
    "items": [
      {
        "description": "智能监控摄像头 A200",
        "quantity": 10,
        "unitPrice": 1200,
        "amount": 12000
      },
      {
        "description": "高清显示器 HD-240",
        "quantity": 5,
        "unitPrice": 2300,
        "amount": 11500
      },
      {
        "description": "数据存储服务器 S-100",
        "quantity": 1,
        "unitPrice": 5100,
        "amount": 5100
      }
    ],
    "customer": {
      "name": "未来安防系统有限公司",
      "address": "上海市浦东新区张江高科技园区科苑路88号",
      "contactPerson": "张经理",
      "phone": "021-88776655",
      "email": "contact@futurasecurity.com"
    },
    "paymentTerms": "款到发货，30天内有效",
    "notes": "请尽快安排送货，需要安装调试服务",
    "confidence": 92,
    "rawText": "订单编号: PO-2023-0458\n日期: 2023年11月15日\n供应商: 智能电子科技有限公司\n\n客户信息:\n公司: 未来安防系统有限公司\n地址: 上海市浦东新区张江高科技园区科苑路88号\n联系人: 张经理\n电话: 021-88776655\n邮箱: contact@futurasecurity.com\n\n商品明细:\n1. 智能监控摄像头 A200 x 10 台，单价: ¥1,200.00，金额: ¥12,000.00\n2. 高清显示器 HD-240 x 5 台，单价: ¥2,300.00，金额: ¥11,500.00\n3. 数据存储服务器 S-100 x 1 台，单价: ¥5,100.00，金额: ¥5,100.00\n\n总金额: ¥28,600.00\n\n付款条款: 款到发货，30天内有效\n备注: 请尽快安排送货，需要安装调试服务"
  };
} 