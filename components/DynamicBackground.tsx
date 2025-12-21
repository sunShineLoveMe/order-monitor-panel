"use client";

import React from "react";

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
      {/* 基础网格层 */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{
          backgroundImage: `linear-gradient(hsl(var(--argus-primary)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--argus-primary)) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 80%)"
        }}
      />
      
      {/* 动态流光背景 */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(var(--argus-primary)), transparent 70%)",
          filter: "blur(100px)",
          animation: "glow 10s ease-in-out infinite"
        }}
      />

      {/* 扫描线动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="w-full h-[300%] opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(0deg, transparent 0%, hsl(var(--argus-primary)) 50%, transparent 100%)",
            backgroundSize: "100% 20px",
            animation: "dataFlow 60s linear infinite"
          }}
        />
      </div>

      {/* 顶部全局扫描条 */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] opacity-[0.1]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--argus-primary)), transparent)",
          animation: "scanline 12s linear infinite"
        }}
      />
    </div>
  );
}
