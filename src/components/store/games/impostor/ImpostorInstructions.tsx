import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
}

const ImpostorInstructions: React.FC<Props> = ({ isOpen, onClose, themeColor }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl border border-border/30 max-h-[70vh] overflow-y-auto"
          style={{ direction: "rtl" }}>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black" style={{ color: themeColor }}>🕵️ كيف تلعب الامبوستر؟</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="font-bold mb-1">🎯 الفكرة</p>
              <p className="text-xs text-muted-foreground">جميع اللاعبين يحصلون على نفس الكلمة السرية ما عدا شخص واحد (الامبوستر) لا يعرف الكلمة!</p>
            </div>

            <div className="space-y-2">
              <p className="font-bold">📋 خطوات اللعب:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-foreground shrink-0">1.</span>
                  <p>اختر عدد اللاعبين (3-10) وإعدادات اللعبة</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-foreground shrink-0">2.</span>
                  <p>كل لاعب يشوف دوره بسرية - الكلمة أو أنه الامبوستر</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-foreground shrink-0">3.</span>
                  <p>بالدور، كل لاعب يعطي تلميح عن الكلمة (أو يسأل سؤال)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-foreground shrink-0">4.</span>
                  <p>بعد انتهاء الوقت، الكل يصوت لمن يعتقد أنه الامبوستر</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="font-bold text-xs text-green-600 mb-1">✅ اللاعب العادي</p>
                <p className="text-[10px] text-muted-foreground">أعطِ تلميحات تدل على الكلمة بدون فضحها وحاول اكتشاف الامبوستر</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="font-bold text-xs text-red-600 mb-1">🕵️ الامبوستر</p>
                <p className="text-[10px] text-muted-foreground">تظاهر أنك تعرف الكلمة! أعطِ تلميحات عامة ولا تنكشف</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="font-bold text-xs text-amber-600 mb-1">⚡ طرق اللعب</p>
              <ul className="text-[10px] text-muted-foreground space-y-1">
                <li>💡 <strong>تلميحات:</strong> كل لاعب يقول كلمة واحدة تلميح</li>
                <li>❓ <strong>أسئلة:</strong> اسأل لاعب معين سؤال عن الكلمة</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImpostorInstructions;
