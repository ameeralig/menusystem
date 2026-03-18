import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";

interface GameInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ isOpen, onClose, themeColor }) => {
  if (!isOpen) return null;

  const sections = [
    {
      emoji: "🎯",
      title: "الهدف",
      content: "اكتشاف هوية المجرم بين اللاعبين من خلال تحليل الأدلة والنقاش الجماعي."
    },
    {
      emoji: "👥",
      title: "عدد اللاعبين",
      content: "من 3 إلى 8 لاعبين. يمكن اللعب محلياً على جهاز واحد أو عبر الإنترنت بحيث كل لاعب على جهازه."
    },
    {
      emoji: "📖",
      title: "مراحل اللعبة",
      steps: [
        "📝 الإعداد: إضافة أسماء اللاعبين واختيار الثيم والصعوبة",
        "🤖 توليد القصة: الذكاء الاصطناعي يكتب لغزاً فريداً",
        "📖 القصة: الجميع يقرأ خلفية الجريمة والأدلة المشتركة",
        "🎭 الأدوار السرية: كل لاعب يرى دوره وقصته الخاصة وأدلته",
        "💬 النقاش: ناقشوا واسألوا واكتشفوا التناقضات",
        "🗳️ التصويت: كل لاعب يصوّت على من يعتقد أنه المجرم",
        "🔓 النتيجة: كشف الحقيقة ومعرفة هل نجح الفريق"
      ]
    },
    {
      emoji: "😈",
      title: "نصائح للمجرم",
      content: "ابقَ هادئاً، ابتكر قصة مقنعة، وجّه الشبهات نحو غيرك، لا تبالغ في الدفاع عن نفسك."
    },
    {
      emoji: "🕵️",
      title: "نصائح للمحققين",
      content: "راقبوا ردود الفعل، قارنوا الأدلة، اسألوا أسئلة مفاجئة، ابحثوا عن التناقضات في الإجابات."
    },
    {
      emoji: "🌐",
      title: "اللعب عبر الإنترنت",
      content: "أنشئ غرفة واحصل على رمز مكون من 5 أحرف، شاركه مع أصدقائك للانضمام من أجهزتهم. كل لاعب يرى فقط معلوماته السرية!"
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl overflow-hidden border border-border/30"
          style={{ direction: "rtl" }}
        >
          <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-base font-black">كيف تلعب؟</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl border border-border/30 bg-card"
              >
                <p className="text-sm font-bold text-foreground mb-1">
                  {s.emoji} {s.title}
                </p>
                {s.content && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
                )}
                {s.steps && (
                  <div className="space-y-1 mt-1">
                    {s.steps.map((step, si) => (
                      <p key={si} className="text-xs text-muted-foreground">{step}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameInstructions;
