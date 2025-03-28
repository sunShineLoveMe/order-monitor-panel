"use client";

import { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/services/database";
import type { InventoryItem } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    loadInventory();
  }, [warehouse, status, search]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const filters = {
        warehouse: warehouse || undefined,
        status: status || undefined,
        search: search || undefined
      };
      const data = await DatabaseService.getInventory(filters);
      setInventory(data);
    } catch (error) {
      console.error("加载库存失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="搜索商品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={warehouse} onValueChange={setWarehouse}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择仓库" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部仓库</SelectItem>
            <SelectItem value="SH">上海仓</SelectItem>
            <SelectItem value="BJ">北京仓</SelectItem>
            <SelectItem value="GZ">广州仓</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="库存状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="normal">正常</SelectItem>
            <SelectItem value="low">偏低</SelectItem>
            <SelectItem value="critical">紧缺</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名称</TableHead>
              <TableHead>类别</TableHead>
              <TableHead>库存数量</TableHead>
              <TableHead>预警阈值</TableHead>
              <TableHead>仓库</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后更新</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.threshold}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "in_stock"
                          ? "default"
                          : item.status === "low_stock"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {item.status === "in_stock"
                        ? "正常"
                        : item.status === "low_stock"
                        ? "偏低"
                        : "缺货"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.lastUpdated).toLocaleString("zh-CN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 