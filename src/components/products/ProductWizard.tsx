
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface WizardStep {
  id: string;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
  component: React.ReactNode;
}

interface ProductWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

const ProductWizard = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  isSubmitting,
}: ProductWizardProps) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-4">
      <div className="steps-indicator flex items-center justify-between px-2 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "step-circle relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                getStepStatus(index) === "completed"
                  ? "bg-primary border-primary text-primary-foreground"
                  : getStepStatus(index) === "current"
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-background border-muted-foreground/30 text-muted-foreground"
              )}
              onClick={() => {
                if (getStepStatus(index) === "completed" || getStepStatus(index) === "current") {
                  onStepChange(index);
                }
              }}
            >
              <span className="text-sm font-medium">{index + 1}</span>
              <div className="absolute -bottom-6 whitespace-nowrap text-xs font-medium">
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-grow h-0.5 mx-1",
                  getStepStatus(index) === "completed"
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="pt-4 mt-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: currentStep === index ? 1 : 0,
              y: currentStep === index ? 0 : 10,
              display: currentStep === index ? "block" : "none",
              height: currentStep === index ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="wizard-step"
          >
            <Card className="p-4 md:p-6 bg-background">
              <h3 className="text-lg font-bold mb-4">{step.title}</h3>
              <div>{step.component}</div>

              <div className="flex justify-between mt-6">
                {index > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onStepChange(index - 1)}
                    disabled={isSubmitting}
                  >
                    السابق
                  </Button>
                ) : (
                  <div></div>
                )}

                {index < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => onStepChange(index + 1)}
                  >
                    التالي
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={onComplete}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? "جاري الحفظ..." : "حفظ المنتج"}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// مكون مبسط لعرض الخطوات بشكل متلاحق للشاشات الصغيرة
export const MobileProductWizard = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  isSubmitting,
}: ProductWizardProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="font-semibold text-base">{steps[currentStep].title}</h2>
        <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
          <span className="font-bold">{currentStep + 1}</span> / {steps.length}
        </div>
      </div>

      <div className="pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[currentStep].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[60vh] flex flex-col justify-between"
          >
            <div>
              {steps[currentStep].component}
            </div>
            
            <div className="flex justify-between mt-8 pt-4 border-t">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onStepChange(currentStep - 1)}
                  disabled={isSubmitting}
                >
                  السابق
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={() => onStepChange(currentStep + 1)}>
                  التالي
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onComplete}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ المنتج"}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductWizard;
