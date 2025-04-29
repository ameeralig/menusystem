
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <div
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
        className
      )}
      {...props}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );
};
