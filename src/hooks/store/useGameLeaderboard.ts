import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GameScore {
  id: string;
  store_owner_id: string;
  game_type: string;
  player_name: string;
  score: number;
  details: any;
  created_at: string;
}

export const useGameLeaderboard = (storeOwnerId?: string, gameType?: string) => {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScores = useCallback(async () => {
    if (!storeOwnerId || !gameType) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("game_scores" as any)
        .select("*")
        .eq("store_owner_id", storeOwnerId)
        .eq("game_type", gameType)
        .order("score", { ascending: false })
        .limit(10);
      setScores((data as any[] as GameScore[]) || []);
    } catch (e) {
      console.error("Error fetching scores:", e);
    } finally {
      setLoading(false);
    }
  }, [storeOwnerId, gameType]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const saveScore = useCallback(async (playerName: string, score: number, details?: any) => {
    if (!storeOwnerId || !gameType || !playerName.trim()) return false;
    try {
      const { error } = await supabase
        .from("game_scores" as any)
        .insert({
          store_owner_id: storeOwnerId,
          game_type: gameType,
          player_name: playerName.trim(),
          score,
          details: details || {},
        } as any);
      if (error) throw error;
      await fetchScores();
      return true;
    } catch (e) {
      console.error("Error saving score:", e);
      return false;
    }
  }, [storeOwnerId, gameType, fetchScores]);

  return { scores, loading, saveScore, refetch: fetchScores };
};
