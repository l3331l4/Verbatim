'use client'

import { Button } from "@/components/ui/button"

interface SmoothScrollButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export function SmoothScrollButton({ targetId, children, className, ...props }: SmoothScrollButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <Button 
      onClick={handleClick} 
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}