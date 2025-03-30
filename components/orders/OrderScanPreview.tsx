import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface OrderScanPreviewProps {
  imageUrl: string;
}

export const OrderScanPreview: React.FC<OrderScanPreviewProps> = ({ imageUrl }) => {
  return (
    <Card className="overflow-hidden relative">
      <div className="relative w-full h-[200px]">
        <Image
          src={imageUrl}
          alt="订单图片预览"
          fill
          style={{ objectFit: "contain" }}
          className="rounded-md"
        />
      </div>
    </Card>
  );
}; 