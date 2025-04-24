
import { ReactNode, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CustomizationSectionProps {
  title: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

const CustomizationSection = ({
  title,
  icon,
  defaultOpen = false,
  children
}: CustomizationSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-6 shadow-md border rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer focus:outline-none">
          <div className="flex items-center gap-3">
            <span className="text-primary">{icon}</span>
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          <div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-300">
          <CardContent className="p-4 pt-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CustomizationSection;
