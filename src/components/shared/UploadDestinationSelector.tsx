import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Server, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export type UploadDestination = 'supabase' | 'cloudflare';

interface UploadDestinationSelectorProps {
  value: UploadDestination;
  onChange: (destination: UploadDestination) => void;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * مكون اختيار وجهة الرفع
 * يتيح للمستخدم الاختيار بين Supabase Storage و Cloudflare R2
 */
const UploadDestinationSelector = ({
  value,
  onChange,
  disabled = false,
  compact = false,
}: UploadDestinationSelectorProps) => {
  const destinations = [
    {
      id: 'supabase' as UploadDestination,
      name: 'Supabase',
      description: 'تخزين افتراضي',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-500',
    },
    {
      id: 'cloudflare' as UploadDestination,
      name: 'Cloudflare R2',
      description: 'سريع وعالمي',
      icon: Cloud,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-500',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">وجهة الرفع:</Label>
        <div className="flex gap-1">
          {destinations.map((dest) => {
            const Icon = dest.icon;
            const isSelected = value === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(dest.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
                  isSelected
                    ? `${dest.bgColor} ${dest.color} ring-1 ring-current`
                    : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="h-3 w-3" />
                {dest.name}
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-500" />
        وجهة الرفع
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {destinations.map((dest) => {
          const Icon = dest.icon;
          const isSelected = value === dest.id;
          
          return (
            <motion.button
              key={dest.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dest.id)}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                isSelected
                  ? `${dest.bgColor} ${dest.borderColor}`
                  : "border-border hover:border-muted-foreground/50 bg-muted/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Icon className={cn("h-6 w-6", isSelected ? dest.color : "text-muted-foreground")} />
              
              <div className="text-center">
                <p className={cn(
                  "font-medium text-sm",
                  isSelected ? dest.color : "text-foreground"
                )}>
                  {dest.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dest.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default UploadDestinationSelector;
