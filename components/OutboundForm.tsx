"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatabaseService } from "@/lib/services/database";
import { useState } from "react";
import type { Order } from "@/lib/data";

interface OutboundFormData {
  productId: string;
  quantity: number;
  location: string;
  recipient: string;
  note?: string;
}

export default function OutboundForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<OutboundFormData>();

  const onSubmit = async (data: OutboundFormData) => {
    try {
      setLoading(true);
      const order: Omit<Order, "id"> = {
        type: "outbound",
        status: "pending",
        order_number: `OUT-${Date.now()}`,
        customer: data.recipient,
        product_name: "", // 将在后端根据productId填充
        quantity: data.quantity,
        value: 0, // 将在后端计算
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        products: [{
          id: data.productId,
          name: "", // 将在后端填充
          quantity: data.quantity,
          price: 0 // 将在后端填充
        }]
      };
      await DatabaseService.createOrder(order);
      reset();
    } catch (error) {
      console.error('创建出库单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="productId">商品</Label>
          <Select {...register("productId", { required: "请选择商品" })}>
            <SelectTrigger>
              <SelectValue placeholder="选择商品" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">iPhone 15</SelectItem>
              <SelectItem value="2">MacBook Pro</SelectItem>
              <SelectItem value="3">AirPods Pro</SelectItem>
            </SelectContent>
          </Select>
          {errors.productId && (
            <p className="text-sm text-red-500">{errors.productId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="quantity">数量</Label>
          <Input
            type="number"
            {...register("quantity", {
              required: "请输入数量",
              min: { value: 1, message: "数量必须大于0" },
            })}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">出库仓库</Label>
          <Select {...register("location", { required: "请选择仓库" })}>
            <SelectTrigger>
              <SelectValue placeholder="选择仓库" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SH">上海仓</SelectItem>
              <SelectItem value="BJ">北京仓</SelectItem>
              <SelectItem value="GZ">广州仓</SelectItem>
            </SelectContent>
          </Select>
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="recipient">收货方</Label>
          <Input {...register("recipient", { required: "请输入收货方" })} />
          {errors.recipient && (
            <p className="text-sm text-red-500">{errors.recipient.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="note">备注</Label>
          <Input {...register("note")} />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "提交中..." : "创建出库单"}
      </Button>
    </form>
  );
} 