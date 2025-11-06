import * as React from "react";
import { cn } from "@/lib/utils";

export interface EyesLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const EyesLoader = ({ className, size = "md", ...props }: EyesLoaderProps) => {
  const sizeClasses = {
    sm: "w-[54px]",
    md: "w-[108px]",
    lg: "w-[162px]"
  };

  return (
    <div
      className={cn("eyes-loader", sizeClasses[size], className)}
      {...props}
      role="status"
      aria-label="جاري التحميل..."
    >
      <span className="sr-only">جاري التحميل...</span>
      <style>{`
        .eyes-loader {
          position: relative;
          display: flex;
          justify-content: space-between;
        }
        .eyes-loader::after,
        .eyes-loader::before {
          content: '';
          display: inline-block;
          width: 48px;
          height: 48px;
          background-color: #000000;
          background-image: radial-gradient(circle 14px, #FFFFFF 100%, transparent 0);
          background-repeat: no-repeat;
          border-radius: 50%;
          animation: eyeMove 10s infinite, blink 10s infinite;
        }
        .eyes-loader.w-\\[54px\\]::after,
        .eyes-loader.w-\\[54px\\]::before {
          width: 24px;
          height: 24px;
          background-image: radial-gradient(circle 7px, #FFFFFF 100%, transparent 0);
        }
        .eyes-loader.w-\\[162px\\]::after,
        .eyes-loader.w-\\[162px\\]::before {
          width: 72px;
          height: 72px;
          background-image: radial-gradient(circle 21px, #FFFFFF 100%, transparent 0);
        }
        @keyframes eyeMove {
          0%, 10% { background-position: 0px 0px; }
          13%, 40% { background-position: -15px 0px; }
          43%, 70% { background-position: 15px 0px; }
          73%, 90% { background-position: 0px 15px; }
          93%, 100% { background-position: 0px 0px; }
        }
        @keyframes blink {
          0%, 10%, 12%, 20%, 22%, 40%, 42%, 60%, 62%, 70%, 72%, 90%, 92%, 98%, 100% {
            height: 48px;
          }
          11%, 21%, 41%, 61%, 71%, 91%, 99% {
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
};
