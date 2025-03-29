"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

export default function GeneralSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "订单监控系统",
    language: "zh_CN",
    timeZone: "Asia/Shanghai",
    enableNotifications: true,
    enableDarkMode: false,
    enableAIFeatures: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 模拟保存设置的API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
      // 这里应该有一个真实的API调用来保存设置
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>通用设置</CardTitle>
        <CardDescription>
          配置系统的基本参数和行为
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">公司/系统名称</Label>
            <Input 
              id="companyName" 
              value={settings.companyName} 
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="language">语言</Label>
              <Select 
                value={settings.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh_CN">简体中文</SelectItem>
                  <SelectItem value="en_US">English (US)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeZone">时区</Label>
              <Select 
                value={settings.timeZone}
                onValueChange={(value) => handleInputChange("timeZone", value)}
              >
                <SelectTrigger id="timeZone">
                  <SelectValue placeholder="选择时区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Shanghai">上海 (GMT+8)</SelectItem>
                  <SelectItem value="America/New_York">纽约 (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">伦敦 (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableNotifications" className="flex-1">启用通知</Label>
              <Switch 
                id="enableNotifications" 
                checked={settings.enableNotifications}
                onCheckedChange={(checked: boolean) => handleInputChange("enableNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enableDarkMode" className="flex-1">启用暗黑模式</Label>
              <Switch 
                id="enableDarkMode" 
                checked={settings.enableDarkMode}
                onCheckedChange={(checked: boolean) => handleInputChange("enableDarkMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enableAIFeatures" className="flex-1">启用AI功能</Label>
              <Switch 
                id="enableAIFeatures" 
                checked={settings.enableAIFeatures}
                onCheckedChange={(checked: boolean) => handleInputChange("enableAIFeatures", checked)}
              />
            </div>
          </div>
        </div>
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