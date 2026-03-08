import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GameScore {
  id: string;
  store_owner_id: string;
  game_type: string;
  player_name: string;
  phone_number: string | null;
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

  const saveScore = useCallback(async (playerName: string, score: number, phoneNumber?: string, details?: any) => {
    if (!storeOwnerId || !gameType || !playerName.trim()) return false;
    try {
      // If phone number provided, check if this phone already has a score for this game+store
      if (phoneNumber?.trim()) {
        const { data: existing } = await supabase
          .from("game_scores" as any)
          .select("id, score")
          .eq("store_owner_id", storeOwnerId)
          .eq("game_type", gameType)
          .eq("phone_number", phoneNumber.trim())
          .limit(1);

        const existingRecord = (existing as any[])?.[0];

        if (existingRecord) {
          // Only update if new score is higher
          if (score > existingRecord.score) {
            const { error } = await supabase
              .from("game_scores" as any)
              .update({
                score,
                player_name: playerName.trim(),
                details: details || {},
              } as any)
              .eq("id", existingRecord.id);
            if (error) throw error;
          }
          await fetchScores();
          return true;
        }
      }

      // No existing record, insert new
      const { error } = await supabase
        .from("game_scores" as any)
        .insert({
          store_owner_id: storeOwnerId,
          game_type: gameType,
          player_name: playerName.trim(),
          phone_number: phoneNumber?.trim() || null,
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
