"use client";

import { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardWidgetsSheetProps {
  children: ReactNode;
  title: string;
  description: string;
  triggerLabel?: string;
}

export function DashboardWidgetsSheet({
  children,
  title,
  description,
  triggerLabel = "Dashboard Menu",
}: Readonly<DashboardWidgetsSheetProps>) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90"
        >
          <Menu className="h-4 w-4 mr-2" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full sm:w-[400px] bg-gradient-to-br from-blue-50 via-white to-blue-100 border-blue-200"
      >
        <SheetHeader className="space-y-3 pb-6 border-b border-blue-200">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {title}
          </SheetTitle>
          <SheetDescription className="text-blue-600">
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
