"use client";

import React, { useEffect, useState } from "react";
import { DatabaseService } from "@/lib/services/database";
import { InventoryItem } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

interface InventoryHeatmapProps {
  className?: string;
}

interface HeatmapData {
  location: string;
  value: number;
}

export function InventoryHeatmap({ className }: InventoryHeatmapProps) {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filters, setFilters] = useState({
    warehouse: "",
    status: "",
    search: "",
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getInventory(filters);
      setInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();

    // 订阅实时更新
    const channel = supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        () => {
          loadInventory();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [filters]);

  const getStatusColor = (item: InventoryItem) => {
    const ratio = item.quantity / item.threshold;
    if (ratio <= 0.5) return "bg-red-500";
    if (ratio <= 0.8) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getHeatmapData = (): HeatmapData[] => {
    const locationMap = new Map<string, number>();
    
    inventory.forEach(item => {
      const current = locationMap.get(item.location) || 0;
      locationMap.set(item.location, current + item.quantity);
    });

    return Array.from(locationMap.entries()).map(([location, value]) => ({
      location,
      value
    }));
  };

  const renderTooltip = (item: InventoryItem) => {
    return (
      <div className="p-2 bg-white rounded shadow-lg border border-gray-200">
        <p className="font-bold">{item.name}</p>
        <p>库存: {item.quantity}</p>
        <p>阈值: {item.threshold}</p>
        <p>仓库: {item.location}</p>
        <p>状态: {item.status}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>库存热力图</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const tooltipContent = (item: InventoryItem) => {
    return (
      <div className="bg-white p-2 rounded shadow-lg text-sm">
        <p>产品: {item.name}</p>
        <p>库存: {item.quantity}</p>
        <p>阈值: {item.threshold}</p>
        <p>仓库: {item.location}</p>
        <p>状态: {item.status}</p>
      </div>
    );
  };

  const heatmapData = getHeatmapData();
  const maxValue = Math.max(...heatmapData.map(d => d.value));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>库存热力图</CardTitle>
        <div className="flex gap-4 mt-4">
          <Select
            value={filters.warehouse}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, warehouse: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择仓库" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部仓库</SelectItem>
              <SelectItem value="北京">北京仓库</SelectItem>
              <SelectItem value="上海">上海仓库</SelectItem>
              <SelectItem value="广州">广州仓库</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="正常">正常</SelectItem>
              <SelectItem value="缺货">缺货</SelectItem>
              <SelectItem value="过剩">过剩</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="搜索商品"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="w-[200px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          {heatmapData.map((data, index) => (
            <div
              key={index}
              className={`relative p-2 rounded cursor-pointer group ${getStatusColor(
                inventory.find(i => i.location === data.location) || inventory[0]
              )}`}
              onMouseEnter={() => {
                const item = inventory.find(i => i.location === data.location);
                if (item) setSelectedItem(item);
              }}
              onMouseLeave={() => setSelectedItem(null)}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity duration-200">
                {selectedItem && selectedItem.location === data.location && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                    {tooltipContent(selectedItem)}
                  </div>
                )}
              </div>
              <div className="text-white text-xs truncate">{data.location}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 