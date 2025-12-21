"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService } from "@/lib/services/dashboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityData {
  month: string;
  intensity: number; // 0-4
  details: string;
}

export function ActivityHeatmap() {
  const [data, setData] = useState<ActivityData[]>([]);

  useEffect(() => {
    const generateActivity = async () => {
      const stats = await dashboardService.getStats();
      const activity = stats.monthlyStats.map((stat: any) => {
        const total = stat.inbound + stat.outbound;
        let intensity = 1;
        if (total > 4000) intensity = 4;
        else if (total > 3000) intensity = 3;
        else if (total > 2000) intensity = 2;
        
        return {
          month: stat.month,
          intensity,
          details: `总活动: ${total} (入: ${stat.inbound}, 出: ${stat.outbound})`
        };
      });
      setData(activity);
    };
    generateActivity();
  }, []);

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-slate-800/10";
      case 1: return "bg-blue-500/20";
      case 2: return "bg-blue-500/40";
      case 3: return "bg-blue-400";
      case 4: return "bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.5)]";
      default: return "bg-slate-800/10";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          2025 全时态活动监测
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 h-24 pt-4">
          <TooltipProvider>
            {data.map((item, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div 
                    className={`flex-1 rounded-sm transition-all hover:scale-110 cursor-crosshair ${getIntensityClass(item.intensity)}`}
                    style={{ height: `${(idx + 1) * 8}%`, pointerEvents: 'auto' }}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-background/90 backdrop-blur-md border-blue-500/30">
                  <div className="text-xs font-mono">
                    <p className="font-bold text-blue-400">{item.month}</p>
                    <p>{item.details}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </CardContent>
    </Card>
  );
}
