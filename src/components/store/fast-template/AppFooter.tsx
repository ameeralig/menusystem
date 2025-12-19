import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

// سجل التحديثات - يتم تحديثه مع كل إصدار جديد
const CHANGELOG = [
  { version: "1.1.1.6", date: "2025-01-19", changes: ["إضافة سجل التحديثات", "فصل التذييل عن الشريط العائم"] },
  { version: "1.1.1.5", date: "2025-01-19", changes: ["نقل رابط QRM فوق الشريط السفلي", "إضافة رقم الإصدار"] },
  { version: "1.1.1.4", date: "2025-01-18", changes: ["تحسين أداء التحميل", "إصلاح مشكلة Skeleton المتكرر"] },
  { version: "1.1.1.3", date: "2025-01-17", changes: ["تحسين واجهة المستخدم", "إضافة تأثيرات حركية"] },
  { version: "1.1.1.2", date: "2025-01-16", changes: ["دعم الوضع الداكن", "تحسين التوافق مع الجوال"] },
  { version: "1.1.1.1", date: "2025-01-15", changes: ["الإصدار الأول", "إطلاق القالب السريع"] },
];

const CURRENT_VERSION = CHANGELOG[0].version;

const AppFooter: React.FC = () => {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <div 
      className="fixed bottom-[140px] left-0 right-0 z-30"
      style={{ direction: 'rtl' }}
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 py-2">
        {/* رابط QRM ورقم الإصدار */}
        <div className="text-center">
          <a 
            href="https://qrmenuc.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
          >
            تحول للتجربة الرقمية مع <span className="font-semibold">QRM</span>
          </a>
          
          {/* رقم الإصدار - قابل للنقر */}
          <button
            onClick={() => setIsChangelogOpen(!isChangelogOpen)}
            className="flex items-center justify-center gap-1 mx-auto mt-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <span>الإصدار {CURRENT_VERSION}</span>
            {isChangelogOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* سجل التحديثات */}
        <AnimatePresence>
          {isChangelogOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto px-4 pt-3 pb-1">
                <h4 className="text-xs font-semibold text-foreground mb-2 text-center">
                  سجل التحديثات
                </h4>
                <div className="space-y-2">
                  {CHANGELOG.map((entry, index) => (
                    <div
                      key={entry.version}
                      className={`text-[10px] p-2 rounded-lg ${
                        index === 0 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-gray-100 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground">
                          v{entry.version}
                          {index === 0 && (
                            <span className="mr-1 text-[8px] bg-primary text-primary-foreground px-1 py-0.5 rounded">
                              حالي
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">{entry.date}</span>
                      </div>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        {entry.changes.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppFooter;
