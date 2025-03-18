import { mockOrders } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export function RecentOrders() {
  // 获取最近5个订单
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border",
              order.type === "inbound"
                ? "border-blue-100 bg-blue-50"
                : "border-green-100 bg-green-50"
            )}
          >
            {order.type === "inbound" ? (
              <ArrowDownIcon className="h-4 w-4 text-blue-500" />
            ) : (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {order.type === "inbound" ? "入库" : "出库"}: {order.productName}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.customer} · {order.quantity} 件
            </p>
          </div>
          <div className="ml-auto font-medium">
            ¥{order.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
} 