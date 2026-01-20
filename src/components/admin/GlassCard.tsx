import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  animate?: boolean;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  gradient,
  animate = true,
  delay = 0,
}) => {
  const Wrapper = animate ? motion.div : "div";
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.4, delay, ease: "easeOut" }
  } : {};

  return (
    <Wrapper
      {...animationProps}
      className={cn(
        "relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl",
        className
      )}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div 
          className={cn(
            "absolute inset-0 opacity-10",
            gradient
          )}
        />
      )}
      
      {/* Light effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Wrapper>
  );
};

export default GlassCard;
