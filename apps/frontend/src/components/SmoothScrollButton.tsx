'use client'

import { Button } from "@/components/ui/button"

interface SmoothScrollButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "lg" | "default" | "icon";
}

export function SmoothScrollButton({ targetId, children, className, size = "lg", ...props }: SmoothScrollButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <Button
      size={size}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}