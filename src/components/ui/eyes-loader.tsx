import * as React from "react";
import { cn } from "@/lib/utils";

export interface EyesLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const EyesLoader = ({ className, size = "md", ...props }: EyesLoaderProps) => {
  const sizeClasses = {
    sm: "scale-50",
    md: "scale-75",
    lg: "scale-100"
  };

  return (
    <div
      className={cn("inline-block", sizeClasses[size], className)}
      {...props}
      role="status"
      aria-label="جاري التحميل..."
    >
      <span className="sr-only">جاري التحميل...</span>
      <div className="book-loader"></div>
      <style>{`
        .book-loader {
          width: 200px;
          height: 140px;
          background: #979794;
          box-sizing: border-box;
          position: relative;
          border-radius: 8px;
          perspective: 1000px;
        }

        .book-loader:before {
          content: '';
          position: absolute;
          left: 10px;
          right: 10px;
          top: 10px;
          bottom: 10px;
          border-radius: 8px;
          background: #f5f5f5 no-repeat;
          background-size: 60px 10px;
          background-image: linear-gradient(#ddd 100px, transparent 0),
                    linear-gradient(#ddd 100px, transparent 0), 
                    linear-gradient(#ddd 100px, transparent 0), 
                    linear-gradient(#ddd 100px, transparent 0), 
                    linear-gradient(#ddd 100px, transparent 0), 
                    linear-gradient(#ddd 100px, transparent 0);
          background-position: 15px 30px, 15px 60px, 15px 90px, 
                    105px 30px, 105px 60px, 105px 90px;
          box-shadow: 0 0 10px rgba(0,0,0,0.25);
        }

        .book-loader:after {
          content: '';
          position: absolute;
          width: calc(50% - 10px);
          right: 10px;
          top: 10px;
          bottom: 10px;
          border-radius: 8px;
          background: #fff no-repeat;
          background-size: 60px 10px;
          background-image: linear-gradient(#ddd 100px, transparent 0), 
                    linear-gradient(#ddd 100px, transparent 0), 
                    linear-gradient(#ddd 100px, transparent 0);
          background-position: 50% 30px, 50% 60px, 50% 90px;
          transform: rotateY(0deg);
          transform-origin: left center;
          animation: paging 1s linear infinite;
        }

        @keyframes paging {
          to {
            transform: rotateY(-180deg);
          }
        }
      `}</style>
    </div>
  );
};
