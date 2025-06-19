"use client";

import { cn } from "@/lib/utils";

export default function BorderBeam({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  borderWidth = 1,
  anchor = 90,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        // mask styles
        "[background:linear-gradient(var(--direction),var(--color-from),var(--color-to),transparent)_border-box]",
        "[mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]",
        "[mask-composite:xor]",
        // pseudo styles
        "before:absolute before:aspect-square before:w-[calc(var(--size)*1px)] before:animate-border-beam before:[animation-delay:var(--delay)] before:[background:linear-gradient(0deg,var(--color-from),var(--color-to))]",
        "before:[offset-anchor:calc(var(--anchor)*1%)_50%] before:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--delay": delay,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--direction": "90deg",
        } as React.CSSProperties
      }
    />
  );
}
