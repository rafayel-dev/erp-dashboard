"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
AvatarRoot.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-surface-2 font-semibold text-text",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export interface AvatarProps {
  name?: string;
  color?: string;
  size?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function Avatar({
  name,
  color,
  size = 36,
  className,
  children,
}: AvatarProps) {
  if (name && color) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
          className
        )}
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          fontSize: size * 0.38,
        }}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <AvatarRoot className={className} style={size ? { width: size, height: size } : undefined}>
      {children}
    </AvatarRoot>
  );
}

export { AvatarRoot as Avatar, AvatarImage, AvatarFallback };
