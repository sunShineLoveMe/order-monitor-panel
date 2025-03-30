"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Camera, ImagePlus, ClipboardPaste, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrderScanResult from "@/components/orders/OrderScanResult";
import { OrderScanPreview } from "@/components/orders/OrderScanPreview";

export default function OrderScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">订单扫描识别</h1>
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
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
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
        </Card>
      </div>
    </div>
  );
} 