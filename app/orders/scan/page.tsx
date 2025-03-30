"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Camera, ImagePlus, ClipboardPaste, CheckCircle, AlertCircle, ArrowLeft, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock components for testing, these will be replaced with real components later
function OrderScanResult({ result }: { result: any }) {
  return (
    <div className="border p-4 rounded-md">
      <h3 className="font-medium mb-2">识别结果 (测试组件)</h3>
      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[300px]">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function OrderScanPreview({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="relative w-full h-[200px]">
        <Image 
          src={imageUrl} 
          alt="订单预览" 
          fill 
          style={{ objectFit: "contain" }} 
        />
      </div>
    </div>
  );
}

export default function OrderScanPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState<boolean>(false);

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  // 处理拖拽文件
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setImageUrl(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 拍照处理
  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // 在实际应用中，这里应该显示一个视频流并拍照
      // 这里简化为一个模拟实现
      setTimeout(() => {
        // 模拟拍照完成
        stream.getTracks().forEach(track => track.stop());
      }, 1000);
    } catch (err) {
      setError("无法访问摄像头，请检查权限设置");
    }
  };

  // 粘贴图片处理
  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const pastedFile = new File([blob], "pasted-image.png", { type });
            setFile(pastedFile);
            setImageUrl(URL.createObjectURL(pastedFile));
            setError(null);
            break;
          }
        }
      }
    } catch (err) {
      setError("无法读取剪贴板内容");
    }
  };

  // 处理扫描识别
  const handleScan = async () => {
    if (!file) {
      setError("请先上传订单图片");
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      // 模拟进度条更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      // 创建FormData以上传图片
      const formData = new FormData();
      formData.append('image', file);

      // 发送图片到API进行分析
      const response = await fetch('/api/orders/scan', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`扫描失败: ${response.statusText}`);
      }

      const result = await response.json();
      
      setScanResult(result);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "订单扫描失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理创建订单
  const handleCreateOrder = useCallback(async () => {
    if (!scanResult) return;
    
    try {
      setCreatingOrder(true);
      
      // 模拟API调用创建订单
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 成功后跳转到订单列表页
      router.push('/orders');
    } catch (err) {
      setError("创建订单失败，请重试");
    } finally {
      setCreatingOrder(false);
    }
  }, [scanResult, router]);

  // 处理扫描错误，添加诊断信息
  const handleScanError = (errorMsg: string) => {    
    // 如果错误信息包含API调用失败，显示模型诊断链接
    if (
      errorMsg.includes("API") || 
      errorMsg.includes("模型") || 
      errorMsg.includes("连接") ||
      errorMsg.includes("fetch failed")
    ) {
      return (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-md mt-4">
          <p className="font-medium text-amber-800 mb-2">检测到可能是模型配置问题</p>
          <p className="text-sm text-amber-700 mb-3">
            您的错误可能与AI模型配置有关。请检查您的模型设置是否正确。
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/models/test">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>诊断模型配置</span>
              </span>
            </Link>
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">订单扫描识别</h1>
        </div>
      </div>
      <p className="text-muted-foreground">
        通过上传订单图片或发票，自动提取并识别订单信息，快速创建订单记录
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>图片上传</CardTitle>
            <CardDescription>
              支持多种方式上传订单图片，系统将自动识别订单信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>上传文件</span>
                </TabsTrigger>
                <TabsTrigger value="camera">
                  <Camera className="h-4 w-4 mr-2" />
                  <span>拍照</span>
                </TabsTrigger>
                <TabsTrigger value="paste">
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  <span>粘贴</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <ImagePlus className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-1">
                    拖拽图片到此处或点击上传
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 JPG, PNG, JPEG 格式
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="camera">
                <div className="flex flex-col items-center justify-center p-6">
                  <Camera className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">使用摄像头拍摄订单照片</p>
                  <Button onClick={handleCapture}>
                    <Camera className="mr-2 h-4 w-4" />
                    开始拍摄
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="paste">
                <div className="flex flex-col items-center justify-center p-6">
                  <ClipboardPaste className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">从剪贴板粘贴图片</p>
                  <Button onClick={handlePaste}>
                    <ClipboardPaste className="mr-2 h-4 w-4" />
                    粘贴图片
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {imageUrl && (
              <div className="mt-4">
                <OrderScanPreview imageUrl={imageUrl} />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-start">
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md flex items-start gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">扫描失败</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
                {handleScanError(error)}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            {loading ? (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span>正在识别订单信息...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            ) : (
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleScan} 
                disabled={!file}
              >
                开始识别
              </Button>
            )}
            {progress === 100 && (
              <div className="flex items-center justify-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                识别完成
              </div>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>识别结果</CardTitle>
            <CardDescription>
              AI识别的订单信息，可以编辑并创建订单
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanResult ? (
              <OrderScanResult result={scanResult} />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <p>请上传订单图片并点击识别按钮</p>
              </div>
            )}
          </CardContent>
          {scanResult && (
            <CardFooter className="flex justify-end space-x-2 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/orders">取消</Link>
              </Button>
              <Button 
                onClick={handleCreateOrder} 
                disabled={creatingOrder}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate.spin" />
                    创建中...
                  </>
                ) : (
                  '创建订单'
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
} 