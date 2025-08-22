'use client'

import { Button } from "@/components/ui/button"

export function SmoothScrollButton({ targetId, children, className, ...props }) {
  const handleClick = (e) => {
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