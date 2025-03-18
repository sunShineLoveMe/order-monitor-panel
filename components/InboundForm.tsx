"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  productName: z.string().min(1, "产品名称不能为空"),
  supplier: z.string().min(1, "供应商不能为空"),
  quantity: z.coerce.number().min(1, "数量必须大于0"),
  unitPrice: z.coerce.number().min(0.01, "单价必须大于0"),
  warehouse: z.string().min(1, "仓库不能为空"),
  expectedDate: z.string().min(1, "预计到货日期不能为空"),
});

type FormValues = z.infer<typeof formSchema>;

export function InboundForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      supplier: "",
      quantity: 0,
      unitPrice: 0,
      warehouse: "",
      expectedDate: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    // TODO: 处理表单提交
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>产品名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入产品名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>供应商</FormLabel>
              <FormControl>
                <Input placeholder="请输入供应商" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>数量</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="请输入数量" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>单价</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="请输入单价" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="warehouse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>仓库</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择仓库" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warehouse-1">仓库一</SelectItem>
                  <SelectItem value="warehouse-2">仓库二</SelectItem>
                  <SelectItem value="warehouse-3">仓库三</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>预计到货日期</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit">提交</Button>
        </div>
      </form>
    </Form>
  );
} 