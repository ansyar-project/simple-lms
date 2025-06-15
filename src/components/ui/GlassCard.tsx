import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly hover?: boolean;
}

export default function GlassCard({
  children,
  className,
  hover = true,
}: GlassCardProps) {
  return (
    <Card
      className={cn(
        "bg-white/70 backdrop-blur-sm border-blue-100 transition-all duration-300",
        hover && "hover:bg-white/80 hover:shadow-xl hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </Card>
  );
}
