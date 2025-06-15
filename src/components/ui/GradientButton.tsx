import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly variant?: "primary" | "outline";
  readonly size?: "default" | "sm" | "lg";
  readonly disabled?: boolean;
  readonly type?: "button" | "submit" | "reset";
  readonly onClick?: () => void;
}

export default function GradientButton({
  children,
  className,
  variant = "primary",
  size = "default",
  disabled = false,
  type = "button",
  onClick,
}: GradientButtonProps) {
  const baseClasses = "transition-all duration-300 transform hover:scale-105";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
    outline:
      "bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90 text-blue-600 border-2 border-blue-500",
  };

  return (
    <Button
      className={cn(baseClasses, variantClasses[variant], className)}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
