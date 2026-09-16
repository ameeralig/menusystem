import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  Brain,
  ChevronLeft,
  Dices,
  Gamepad2,
  ScanSearch,
  Sparkles,
  Trophy,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import { useUnifiedStoreData } from "@/hooks/store/useUnifiedStoreData";
import { useOptimizedProducts } from "@/hooks/store/useOptimizedProducts";
import WheelModal from "@/components/store/WheelModal";
import MemoryMatchGame from "@/components/store/games/MemoryMatchGame";
import PriceGuessGame from "@/components/store/games/PriceGuessGame";
import BillPayerGame from "@/components/store/games/BillPayerGame";
import DetectiveGame from "@/components/store/games/DetectiveGame";
import ImpostorGame from "@/components/store/games/impostor/ImpostorGame";
import { useGameLeaderboard } from "@/hooks/store/useGameLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type GameId = "detective" | "impostor" | "wheel" | "memory" | "price" | "billpayer";
type Tab = "games" | "leaderboard";

const GAMES = [
  {
    id: "detective" as GameId,
    name: "من هو المجرم؟",
    description: "حلّ القضية مع أصدقائك واكشف المجرم قبل فوات الأوان.",
    tag: "تحقيق جماعي",
    icon: ScanSearch,
    tone: "purple",
  },
  {
    id: "impostor" as GameId,
    name: "الامبوستر",
    description: "اكتشف الدخيل الذي لا يعرف الكلمة بين أفراد المجموعة.",
    tag: "ذكاء وخداع",
    icon: UserRoundSearch,
    tone: "rose",
  },
  {
    id: "wheel" as GameId,
    name: "عجلة الحظ",
    description: "دوّر العجلة وخلي الحظ يختار لك منتجاً من المنيو.",
    tag: "حظ",
    icon: Dices,
    tone: "teal",
  },
  {
    id: "memory" as GameId,
    name: "طابق واربح",
    description: "اعثر على أزواج المنتجات المتطابقة قبل انتهاء الوقت.",
    tag: "ذاكرة",
    icon: Brain,
    tone: "purple",
  },
  {
    id: "price" as GameId,
    name: "خمّن السعر",
    description: "اختبر معرفتك بالمنيو وخمّن السعر الأقرب للمنتج.",
    tag: "تحدّي أسعار",
    icon: BadgeDollarSign,
    tone: "teal",
  },
  {
    id: "billpayer" as GameId,
    name: "من يدفع الحساب؟",
    description: "أضف أسماء أصدقائك ودع الاختيار العشوائي يحسمها.",
    tag: "للأصدقاء",
    icon: UsersRound,
    tone: "rose",
  },
];

const toneClasses = {
  purple: {
    icon: "bg-[hsl(var(--game-purple)/0.14)] text-[hsl(var(--game-purple))] border-[hsl(var(--game-purple)/0.28)]",
    tag: "text-[hsl(var(--game-purple))] border-[hsl(var(--game-purple)/0.22)] bg-[hsl(var(--game-purple)/0.08)]",
    glow: "group-hover:shadow-[0_20px_50px_-24px_hsl(var(--game-purple)/0.65)] group-hover:border-[hsl(var(--game-purple)/0.45)]",
  },
  teal: {
    icon: "bg-[hsl(var(--game-teal)/0.14)] text-[hsl(var(--game-teal))] border-[hsl(var(--game-teal)/0.28)]",
    tag: "text-[hsl(var(--game-teal))] border-[hsl(var(--game-teal)/0.22)] bg-[hsl(var(--game-teal)/0.08)]",
    glow: "group-hover:shadow-[0_20px_50px_-24px_hsl(var(--game-teal)/0.65)] group-hover:border-[hsl(var(--game-teal)/0.45)]",
  },
  rose: {
    icon: "bg-[hsl(var(--game-rose)/0.14)] text-[hsl(var(--game-rose))] border-[hsl(var(--game-rose)/0.28)]",
    tag: "text-[hsl(var(--game-rose))] border-[hsl(var(--game-rose)/0.22)] bg-[hsl(var(--game-rose)/0.08)]",
    glow: "group-hover:shadow-[0_20px_50px_-24px_hsl(var(--game-rose)/0.65)] group-hover:border-[hsl(var(--game-rose)/0.45)]",
  },
};

const LeaderboardPanel: React.FC<{
  storeOwnerId?: string;
  gameType: "memory" | "price_guess";
  title: string;
}> = ({ storeOwnerId, gameType, title }) => {
  const { scores, loading } = useGameLeaderboard(storeOwnerId, gameType);

  return (
    <section className="overflow-hidden rounded-lg border border-[hsl(var(--game-border))] bg-[hsl(var(--game-surface)/0.82)]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--game-border))] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--game-purple)/0.28)] bg-[hsl(var(--game-purple)/0.12)] text-[hsl(var(--game-purple))]">
            <Trophy className="h-4 w-4" />
          </span>
          <h2 className="games-page__title text-base font-bold">{title}</h2>
        </div>
        <span className="text-xs text-[hsl(var(--game-muted))]">أفضل النتائج</span>
      </div>

      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="space-y-2" aria-label="جاري تحميل النتائج">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-14 w-full bg-[hsl(var(--game-surface-soft))]" />
            ))}
          </div>
        ) : scores.length === 0 ? (
          <div className="py-10 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-[hsl(var(--game-muted))]" />
            <p className="font-semibold">لا توجد نتائج بعد</p>
            <p className="mt-1 text-xs text-[hsl(var(--game-muted))]">الصدارة تنتظر أول لاعب</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {scores.slice(0, 10).map((score, index) => (
              <li
                key={score.id}
                className="flex min-h-14 items-center gap-3 rounded-md border border-[hsl(var(--game-border)/0.75)] bg-[hsl(var(--game-bg)/0.5)] px-3"
              >
                <span className={`games-page__title flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-black ${index === 0 ? "bg-[hsl(var(--game-purple))] text-[hsl(var(--game-bg))]" : index === 1 ? "bg-[hsl(var(--game-teal)/0.18)] text-[hsl(var(--game-teal))]" : "bg-[hsl(var(--game-rose)/0.14)] text-[hsl(var(--game-rose))]"}`}>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{score.player_name}</span>
                <span className="games-page__title text-sm font-bold text-[hsl(var(--game-purple))]">{score.score.toLocaleString("ar-IQ")}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};

/**
 * صفحة الألعاب المخصصة لكل متجر: /:slug/games
 * تعرض قائمة الألعاب مباشرة، والرجوع يعيد المستخدم لصفحة المتجر.
 */
const GamesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { storeData, isLoading } = useUnifiedStoreData(slug);
  const { allProducts } = useOptimizedProducts({
    userId: storeData?.userId || null,
    selectedCategory: null,
    searchQuery: "",
    forceRefresh: 0,
  });

  const [wheelOpen, setWheelOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);
  const [detectiveOpen, setDetectiveOpen] = useState(false);
  const [impostorOpen, setImpostorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("games");

  const goBack = () => navigate(`/${slug}`);

  const colorTheme = storeData?.colorTheme || null;
  const storeOwnerId = storeData?.userId || undefined;

  const openGame = (gameId: GameId) => {
    if (gameId === "wheel") setWheelOpen(true);
    if (gameId === "memory") setMemoryOpen(true);
    if (gameId === "price") setPriceOpen(true);
    if (gameId === "billpayer") setBillOpen(true);
    if (gameId === "detective") setDetectiveOpen(true);
    if (gameId === "impostor") setImpostorOpen(true);
  };

  if (isLoading) {
    return (
      <div className="games-page min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-24 w-full bg-[hsl(var(--game-surface))]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-[hsl(var(--game-surface))]" />
          ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="games-page games-page__grid min-h-screen" dir="rtl">
      <Helmet>
        <title>{`ألعاب ${storeData?.storeName || "المتجر"}`}</title>
        <meta name="description" content="العب واربح مع ألعاب المتجر التفاعلية" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          className="mb-5 h-10 gap-2 rounded-md px-2 text-[hsl(var(--game-muted))] hover:bg-[hsl(var(--game-surface))] hover:text-[hsl(var(--game-text))]"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى المنيو
        </Button>

        <header className="mb-7 border-b border-[hsl(var(--game-border))] pb-7 sm:mb-9 sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div className="mb-6 sm:mb-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[hsl(var(--game-teal))]">
              <Gamepad2 className="h-4 w-4" />
              <span>{storeData?.storeName || "المتجر"}</span>
              <span className="h-1 w-1 rounded-full bg-[hsl(var(--game-muted))]" />
              <span>منطقة اللعب</span>
            </div>
            <h1 className="games-page__title text-4xl font-bold leading-tight sm:text-5xl">
              مركز <span className="text-[hsl(var(--game-purple))]">الألعاب</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[hsl(var(--game-muted))] sm:text-base">
              اختار لعبتك، تحدّى جماعتك، وسجّل أعلى نتيجة.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-lg border border-[hsl(var(--game-border))] bg-[hsl(var(--game-surface))] p-1" role="tablist" aria-label="أقسام مركز الألعاب">
            {([
              { id: "games" as Tab, label: "الألعاب", icon: Gamepad2 },
              { id: "leaderboard" as Tab, label: "المتصدرون", icon: Trophy },
            ]).map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant="ghost"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-10 rounded-md px-4 ${activeTab === tab.id ? "bg-[hsl(var(--game-purple))] text-[hsl(var(--game-bg))] hover:bg-[hsl(var(--game-purple))] hover:text-[hsl(var(--game-bg))]" : "text-[hsl(var(--game-muted))] hover:bg-[hsl(var(--game-surface-soft))] hover:text-[hsl(var(--game-text))]"}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "games" ? (
            <motion.section
              key="games"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
            >
              {GAMES.map((game, index) => {
                const Icon = game.icon;
                const tone = toneClasses[game.tone];
                return (
                  <motion.article
                    key={game.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.055 }}
                    className={`group flex min-h-64 flex-col overflow-hidden rounded-lg border border-[hsl(var(--game-border))] bg-[hsl(var(--game-surface)/0.88)] transition-all duration-300 hover:-translate-y-1 ${tone.glow}`}
                  >
                    <div className="relative flex min-h-32 items-center justify-center overflow-hidden border-b border-[hsl(var(--game-border))] bg-[hsl(var(--game-bg)/0.62)]">
                      <div className="absolute inset-0 games-page__grid opacity-80" />
                      <div className={`relative flex h-20 w-20 items-center justify-center rounded-lg border ${tone.icon}`}>
                        <Icon className="h-9 w-9" strokeWidth={1.7} />
                      </div>
                      <span className={`absolute right-3 top-3 rounded-md border px-2.5 py-1 text-[10px] font-bold ${tone.tag}`}>
                        {game.tag}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h2 className="games-page__title text-xl font-bold">{game.name}</h2>
                      <p className="mt-2 flex-1 text-sm leading-6 text-[hsl(var(--game-muted))]">{game.description}</p>
                      <Button
                        type="button"
                        onClick={() => openGame(game.id)}
                        className="mt-5 h-11 w-full rounded-md border border-[hsl(var(--game-border))] bg-[hsl(var(--game-surface-soft))] text-[hsl(var(--game-text))] hover:border-[hsl(var(--game-purple)/0.55)] hover:bg-[hsl(var(--game-purple))] hover:text-[hsl(var(--game-bg))]"
                      >
                        العب الآن
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </motion.section>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-4 lg:grid-cols-2"
            >
              <LeaderboardPanel storeOwnerId={storeOwnerId} gameType="memory" title="طابق واربح" />
              <LeaderboardPanel storeOwnerId={storeOwnerId} gameType="price_guess" title="خمّن السعر" />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-8 flex items-center justify-center gap-2 border-t border-[hsl(var(--game-border))] py-6 text-xs text-[hsl(var(--game-muted))]">
          <Sparkles className="h-4 w-4 text-[hsl(var(--game-teal))]" />
          العب، تنافس، وخلي اسمك بالصدارة
        </footer>
      </main>

      <WheelModal
        isOpen={wheelOpen}
        onClose={() => setWheelOpen(false)}
        products={allProducts}
        colorTheme={colorTheme || undefined}
      />
      <MemoryMatchGame
        isOpen={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        products={allProducts}
        colorTheme={colorTheme || undefined}
        storeOwnerId={storeOwnerId}
      />
      <PriceGuessGame
        isOpen={priceOpen}
        onClose={() => setPriceOpen(false)}
        products={allProducts}
        colorTheme={colorTheme || undefined}
        storeOwnerId={storeOwnerId}
      />
      <BillPayerGame
        isOpen={billOpen}
        onClose={() => setBillOpen(false)}
        colorTheme={colorTheme || undefined}
      />
      <DetectiveGame
        isOpen={detectiveOpen}
        onClose={() => setDetectiveOpen(false)}
        colorTheme={colorTheme || undefined}
        storeOwnerId={storeOwnerId}
      />
      <ImpostorGame
        isOpen={impostorOpen}
        onClose={() => setImpostorOpen(false)}
        colorTheme={colorTheme || undefined}
        storeOwnerId={storeOwnerId}
      />
    </div>
  );
};

export default GamesPage;
