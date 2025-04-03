
import { ReactNode } from "react";

interface DemoContainerProps {
  children: ReactNode;
}

const DemoContainer = ({ children }: DemoContainerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {children}
      </div>
    </div>
  );
};

export default DemoContainer;
