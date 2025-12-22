"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService } from "@/lib/services/dashboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DayActivity {
  date: string;
  intensity: number; // 0-4
  count: number;
}

interface ActivityHeatmapProps {
  standalone?: boolean;
}

export function ActivityHeatmap({ standalone = false }: ActivityHeatmapProps) {
  const [data, setData] = useState<DayActivity[]>([]);

  // Simulate daily data for 2025
  useEffect(() => {
    const generateActivity = async () => {
      const stats = await dashboardService.getStats();
      const monthlyStats = stats.monthlyStats;
      
      const yearlyData: DayActivity[] = [];
      const startDate = new Date(2025, 0, 1);
      
      // For a clean grid, we generate 371 days (53 weeks)
      for (let i = 0; i < 371; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        if (d.getFullYear() > 2025) break;

        const month = d.getMonth();
        const monthStat = monthlyStats[month] || { inbound: 100, outbound: 100 };
        const baseActivity = (monthStat.inbound + monthStat.outbound) / 30;
        
        // Add randomness
        const count = Math.max(0, Math.round(baseActivity + (Math.random() - 0.5) * baseActivity * 0.8));
        let intensity = 0;
        if (count > 120) intensity = 4;
        else if (count > 80) intensity = 3;
        else if (count > 40) intensity = 2;
        else if (count > 0) intensity = 1;

        yearlyData.push({
          date: d.toISOString().split('T')[0],
          intensity,
          count
        });
      }
      setData(yearlyData);
    };
    generateActivity();
  }, []);

  // Group into weeks (7 days each)
  const weeks = useMemo(() => {
    const w: DayActivity[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      w.push(data.slice(i, i + 7));
    }
    return w;
  }, [data]);

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-slate-800/30";
      case 1: return "bg-emerald-900/40";
      case 2: return "bg-emerald-700/60";
      case 3: return "bg-emerald-500";
      case 4: return "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.4)]";
      default: return "bg-slate-800/30";
    }
  };

  const content = (
    <div className="space-y-3">
      <div className="flex gap-[3px] overflow-x-auto pb-2 scrollbar-none">
        {/* Day labels column */}
        <div className="flex flex-col gap-[3px] pr-2 text-[10px] text-muted-foreground font-mono justify-between py-1">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>
        
        {/* Grid columns */}
        <div className="flex gap-[3px]">
          <TooltipProvider delayDuration={0}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dayIdx) => (
                  <Tooltip key={dayIdx}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`w-[10px] h-[10px] rounded-[2px] transition-all hover:ring-1 hover:ring-emerald-400 cursor-help ${getIntensityClass(day.intensity)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-background/95 backdrop-blur-md border-emerald-500/30 px-2 py-1.5">
                      <div className="text-[10px] font-mono">
                        <p className="font-bold text-emerald-400">{day.date}</p>
                        <p>活动次数: <span className="text-foreground">{day.count}</span></p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <p>2025 全链路活动监控引擎自适应 (实时状态: 卓越)</p>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2 h-2 rounded-[1px] bg-slate-800/30" />
          <div className="w-2 h-2 rounded-[1px] bg-emerald-900/40" />
          <div className="w-2 h-2 rounded-[1px] bg-emerald-700/60" />
          <div className="w-2 h-2 rounded-[1px] bg-emerald-500" />
          <div className="w-2 h-2 rounded-[1px] bg-emerald-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );

  if (standalone) {
    return content;
  }

  return (
    <Card className="glass-card border-blue-500/10">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          2025 全时态活动监测
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {content}
      </CardContent>
    </Card>
  );
}
