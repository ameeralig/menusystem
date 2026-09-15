import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useUnifiedStoreData } from "@/hooks/store/useUnifiedStoreData";
import { useOptimizedProducts } from "@/hooks/store/useOptimizedProducts";
import GamesMenuModal from "@/components/store/games/GamesMenuModal";
import WheelModal from "@/components/store/WheelModal";
import MemoryMatchGame from "@/components/store/games/MemoryMatchGame";
import PriceGuessGame from "@/components/store/games/PriceGuessGame";
import BillPayerGame from "@/components/store/games/BillPayerGame";
import DetectiveGame from "@/components/store/games/DetectiveGame";
import ImpostorGame from "@/components/store/games/impostor/ImpostorGame";
import { Skeleton } from "@/components/ui/skeleton";

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

  const goBack = () => navigate(`/${slug}`);

  const colorTheme = storeData?.colorTheme || null;
  const storeOwnerId = storeData?.userId || undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`ألعاب ${storeData?.storeName || "المتجر"}`}</title>
        <meta name="description" content="العب واربح مع ألعاب المتجر التفاعلية" />
      </Helmet>

      <GamesMenuModal
        isOpen
        onClose={goBack}
        onSelectGame={(gameId) => {
          if (gameId === "wheel") setWheelOpen(true);
          if (gameId === "memory") setMemoryOpen(true);
          if (gameId === "price") setPriceOpen(true);
          if (gameId === "billpayer") setBillOpen(true);
          if (gameId === "detective") setDetectiveOpen(true);
          if (gameId === "impostor") setImpostorOpen(true);
        }}
        colorTheme={colorTheme || undefined}
        storeOwnerId={storeOwnerId}
      />

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
