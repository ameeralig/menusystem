import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Crown, Users, Loader2, Search, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GameData {
  story: { title: string; setting: string; background: string; crime: string };
  players: { name: string; role: string; private_story: string; secret: string; clues: string[] }[];
  shared_clues: string[];
  solution: { criminal: string; explanation: string };
}

interface RoomRow {
  id: string; room_code: string; host_device_id: string; phase: string;
  game_data: GameData | null; difficulty: string; theme: string; store_owner_id: string | null;
}

interface PlayerRow {
  id: string; room_id: string; player_name: string; device_id: string;
  player_index: number | null; has_voted: boolean; vote_target: string | null;
}

type Screen = "menu" | "lobby" | "game";
type Difficulty = "easy" | "medium" | "hard";
type Theme = "modern" | "historical" | "horror" | "funny" | "random";

const THEMES = [
  { id: "modern" as Theme, label: "عصري", emoji: "🏙️" },
  { id: "historical" as Theme, label: "تاريخي", emoji: "🏛️" },
  { id: "horror" as Theme, label: "رعب", emoji: "👻" },
  { id: "funny" as Theme, label: "كوميدي", emoji: "😂" },
  { id: "random" as Theme, label: "عشوائي", emoji: "🎲" },
];

const DIFFICULTIES = [
  { id: "easy" as Difficulty, label: "سهل", emoji: "🟢" },
  { id: "medium" as Difficulty, label: "متوسط", emoji: "🟡" },
  { id: "hard" as Difficulty, label: "صعب", emoji: "🔴" },
];

const getDeviceId = () => {
  let id = localStorage.getItem("detective_device_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("detective_device_id", id); }
  return id;
};

const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

interface Props {
  onBack: () => void;
  themeColor: string;
  storeOwnerId?: string;
}

const OnlineDetectiveGame: React.FC<Props> = ({ onBack, themeColor: tc, storeOwnerId }) => {
  const deviceId = useRef(getDeviceId()).current;
  const [screen, setScreen] = useState<Screen>("menu");
  const [menuTab, setMenuTab] = useState<"create" | "join">("create");
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [theme, setTheme] = useState<Theme>("random");
  const [showClues, setShowClues] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const myPlayer = players.find(p => p.device_id === deviceId);
  const myGameData = room?.game_data && myPlayer?.player_index != null
    ? room.game_data.players[myPlayer.player_index] : null;

  // Realtime subscriptions
  useEffect(() => {
    if (!room?.id) return;
    const channel = supabase.channel(`detective-${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "detective_rooms", filter: `id=eq.${room.id}` },
        (payload: any) => { if (payload.new) setRoom(payload.new as RoomRow); })
      .on("postgres_changes", { event: "*", schema: "public", table: "detective_players", filter: `room_id=eq.${room.id}` },
        () => fetchPlayers(room.id))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room?.id]);

  const fetchPlayers = async (roomId: string) => {
    const { data } = await (supabase.from("detective_players" as any).select("*").eq("room_id", roomId).order("joined_at") as any);
    if (data) setPlayers(data);
  };

  const createRoom = async () => {
    if (!playerName.trim()) { toast.error("أدخل اسمك"); return; }
    setLoading(true);
    try {
      const code = generateRoomCode();
      const { data: roomData, error } = await (supabase.from("detective_rooms" as any).insert({
        room_code: code, host_device_id: deviceId, store_owner_id: storeOwnerId || null,
        difficulty, theme
      }).select().single() as any);
      if (error) throw error;
      // Join as host
      await (supabase.from("detective_players" as any).insert({
        room_id: roomData.id, player_name: playerName.trim(), device_id: deviceId
      }) as any);
      setRoom(roomData);
      setIsHost(true);
      await fetchPlayers(roomData.id);
      setScreen("lobby");
    } catch (e: any) {
      toast.error("فشل إنشاء الغرفة");
    } finally { setLoading(false); }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !joinCode.trim()) { toast.error("أدخل اسمك ورمز الغرفة"); return; }
    setLoading(true);
    try {
      const { data: roomData, error: rErr } = await (supabase.from("detective_rooms" as any)
        .select("*").eq("room_code", joinCode.trim().toUpperCase()).single() as any);
      if (rErr || !roomData) { toast.error("الغرفة غير موجودة"); setLoading(false); return; }
      if (roomData.phase !== "waiting") { toast.error("اللعبة بدأت بالفعل"); setLoading(false); return; }
      // Check max players
      const { data: existing } = await (supabase.from("detective_players" as any)
        .select("id").eq("room_id", roomData.id) as any);
      if (existing && existing.length >= 8) { toast.error("الغرفة ممتلئة"); setLoading(false); return; }
      // Join
      const { error: jErr } = await (supabase.from("detective_players" as any).insert({
        room_id: roomData.id, player_name: playerName.trim(), device_id: deviceId
      }) as any);
      if (jErr) { toast.error("فشل الانضمام"); setLoading(false); return; }
      setRoom(roomData);
      setIsHost(roomData.host_device_id === deviceId);
      await fetchPlayers(roomData.id);
      setScreen("lobby");
    } catch { toast.error("خطأ غير متوقع"); }
    finally { setLoading(false); }
  };

  const startOnlineGame = async () => {
    if (!room || players.length < 3) { toast.error("يجب 3 لاعبين على الأقل"); return; }
    setLoading(true);
    try {
      // Update phase to loading
      await (supabase.from("detective_rooms" as any).update({ phase: "loading" }).eq("id", room.id) as any);
      const names = players.map(p => p.player_name);
      const { data, error } = await supabase.functions.invoke("generate-detective-story", {
        body: { playerNames: names, difficulty: room.difficulty, theme: room.theme },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Assign player_index
      for (let i = 0; i < players.length; i++) {
        await (supabase.from("detective_players" as any).update({ player_index: i }).eq("id", players[i].id) as any);
      }
      // Update room with game data
      await (supabase.from("detective_rooms" as any).update({
        game_data: data, phase: "story"
      }).eq("id", room.id) as any);
      await fetchPlayers(room.id);
    } catch (e: any) {
      toast.error(e.message || "فشل بدء اللعبة");
      await (supabase.from("detective_rooms" as any).update({ phase: "waiting" }).eq("id", room.id) as any);
    } finally { setLoading(false); }
  };

  const advancePhase = async (nextPhase: string) => {
    if (!room) return;
    await (supabase.from("detective_rooms" as any).update({ phase: nextPhase }).eq("id", room.id) as any);
  };

  const submitVote = async (targetName: string) => {
    if (!myPlayer) return;
    await (supabase.from("detective_players" as any).update({
      has_voted: true, vote_target: targetName
    }).eq("id", myPlayer.id) as any);
    await fetchPlayers(room!.id);
    // Check if all voted
    const updated = await (supabase.from("detective_players" as any)
      .select("*").eq("room_id", room!.id) as any);
    if (updated.data?.every((p: PlayerRow) => p.has_voted)) {
      await advancePhase("result");
    }
  };

  const copyCode = () => {
    if (room) { navigator.clipboard.writeText(room.room_code); toast.success("تم نسخ الرمز!"); }
  };

  // ============ RENDERS ============

  // MENU SCREEN
  if (screen === "menu") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 border border-border/30">
          {[{ key: "create" as const, label: "🏠 إنشاء غرفة" }, { key: "join" as const, label: "🚪 انضمام" }].map(tab => (
            <button key={tab.key} onClick={() => setMenuTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${menuTab === tab.key ? "text-white shadow-lg" : "text-muted-foreground"}`}
              style={menuTab === tab.key ? { background: `linear-gradient(135deg, ${tc}, ${tc}cc)` } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        <Input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="اسمك..." className="text-sm" />

        {menuTab === "create" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">🎭 الثيم</label>
              <div className="grid grid-cols-5 gap-1.5">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-[10px] transition-all ${theme === t.id ? "border-2 shadow" : "border-border/30"}`}
                    style={theme === t.id ? { borderColor: tc, background: `${tc}15` } : {}}>
                    <span className="text-base">{t.emoji}</span>
                    <span className="text-foreground">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">⚡ الصعوبة</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d.id} onClick={() => setDifficulty(d.id)}
                    className={`flex items-center justify-center gap-1 p-2 rounded-lg border text-xs font-bold transition-all ${difficulty === d.id ? "border-2 shadow" : "border-border/30"}`}
                    style={difficulty === d.id ? { borderColor: tc, background: `${tc}15` } : {}}>
                    {d.emoji} {d.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={createRoom} disabled={loading || !playerName.trim()}
              className="w-full h-11 text-white font-bold rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🏠 إنشاء غرفة"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="رمز الغرفة (5 أحرف)..." className="text-center text-lg font-mono tracking-widest" maxLength={5} />
            <Button onClick={joinRoom} disabled={loading || !playerName.trim() || joinCode.length < 5}
              className="w-full h-11 text-white font-bold rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🚪 انضمام"}
            </Button>
          </div>
        )}

        <button onClick={onBack} className="w-full text-xs text-muted-foreground hover:text-foreground py-2">
          ← العودة للوضع المحلي
        </button>
      </motion.div>
    );
  }

  // LOBBY SCREEN
  if (screen === "lobby" && room?.phase === "waiting") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Room Code */}
        <div className="text-center p-4 rounded-2xl border border-border/30" style={{ background: `${tc}08` }}>
          <p className="text-xs text-muted-foreground mb-1">رمز الغرفة</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black tracking-[0.3em] text-foreground">{room.room_code}</span>
            <button onClick={copyCode} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">شارك الرمز مع أصدقائك للانضمام</p>
        </div>

        {/* Players List */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> اللاعبون ({players.length}/8)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {players.map((p, i) => (
              <motion.div key={p.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-border/30 bg-card">
                <span className="text-lg">{p.device_id === room.host_device_id ? "👑" : "🕵️"}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{p.player_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.device_id === room.host_device_id ? "المضيف" : `لاعب ${i + 1}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <Button onClick={startOnlineGame} disabled={loading || players.length < 3}
            className="w-full h-11 text-white font-bold rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
            🕵️ ابدأ التحقيق! ({players.length} لاعبين)
          </Button>
        )}
        {!isHost && (
          <div className="text-center p-4 rounded-xl bg-muted/30">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">بانتظار المضيف لبدء اللعبة...</p>
          </div>
        )}
      </motion.div>
    );
  }

  // LOADING
  if (room?.phase === "loading") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="text-sm font-bold text-foreground">🔍 جاري إنشاء القصة...</p>
        <p className="text-xs text-muted-foreground">الذكاء الاصطناعي يكتب لغزاً مشوقاً</p>
      </motion.div>
    );
  }

  // GAME PHASES
  const gd = room?.game_data;
  if (!gd || !room) return null;

  // Clue Review Panel (reusable)
  const ClueReviewPanel = () => (
    <AnimatePresence>
      {showClues && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="space-y-2 p-3 rounded-xl border border-border/30 bg-card">
            <p className="text-xs font-bold text-foreground">🔍 الأدلة المشتركة:</p>
            {gd.shared_clues.map((c, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {c}</p>
            ))}
            {myGameData && (
              <>
                <hr className="border-border/30" />
                <p className="text-xs font-bold text-foreground">🔒 أدلتك الخاصة:</p>
                {myGameData.clues.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {c}</p>
                ))}
                <p className="text-xs text-muted-foreground">🤫 سرك: {myGameData.secret}</p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ClueToggleButton = () => (
    <button onClick={() => setShowClues(!showClues)}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-border/30 bg-card hover:bg-muted/50 text-foreground transition-all">
      <Search className="h-3 w-3" />
      {showClues ? "إخفاء الأدلة" : "مراجعة الأدلة"}
      {showClues ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    </button>
  );

  // STORY PHASE
  if (room.phase === "story") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="rounded-2xl p-4 border border-border/30" style={{ background: `${tc}08` }}>
          <h3 className="text-lg font-black text-foreground mb-2">📖 {gd.story.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">📍 {gd.story.setting}</p>
          <p className="text-sm text-foreground leading-relaxed mb-3">{gd.story.background}</p>
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm font-bold text-destructive">⚠️ الجريمة</p>
            <p className="text-sm text-foreground mt-1">{gd.story.crime}</p>
          </div>
        </div>
        {/* Shared Clues */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-foreground">🔍 الأدلة المشتركة</p>
          {gd.shared_clues.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="p-2.5 rounded-xl border border-border/30 bg-card">
              <p className="text-xs text-foreground"><span className="font-bold" style={{ color: tc }}>دليل {i + 1}: </span>{c}</p>
            </motion.div>
          ))}
        </div>
        {isHost && (
          <Button onClick={() => advancePhase("roles")}
            className="w-full h-11 text-white font-bold rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
            🎭 الانتقال لكشف الأدوار
          </Button>
        )}
        {!isHost && <p className="text-center text-xs text-muted-foreground">⏳ بانتظار المضيف...</p>}
      </motion.div>
    );
  }

  // ROLES PHASE - each player sees only their own role
  if (room.phase === "roles") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {myGameData ? (
          <div className="space-y-3">
            <div className="text-center p-4 rounded-2xl border-2" style={{ borderColor: tc, background: `${tc}08` }}>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.5 }} className="text-4xl mb-2">
                {myGameData.role === "criminal" ? "😈" : "😇"}
              </motion.div>
              <p className="text-lg font-black text-foreground">
                {myGameData.role === "criminal" ? "أنت المجرم!" : "أنت بريء"}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border/30 bg-card space-y-2">
              <p className="text-sm text-foreground">{myGameData.private_story}</p>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">🤫 سرك: {myGameData.secret}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground mb-1">أدلتك الخاصة:</p>
                {myGameData.clues.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {c}</p>
                ))}
              </div>
            </div>
            {/* Tips */}
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="text-xs font-bold text-amber-600 mb-1">
                {myGameData.role === "criminal" ? "😈 نصائح للمجرم:" : "🕵️ نصائح للمحقق:"}
              </p>
              {myGameData.role === "criminal" ? (
                <div className="space-y-0.5 text-xs text-amber-700">
                  <p>• ابقَ هادئاً ولا تبالغ في الدفاع</p>
                  <p>• وجّه الشبهات نحو لاعب آخر بذكاء</p>
                  <p>• ابتكر تفسيراً مقنعاً لكل دليل ضدك</p>
                  <p>• اسأل أسئلة لتبدو مهتماً بالتحقيق</p>
                </div>
              ) : (
                <div className="space-y-0.5 text-xs text-amber-700">
                  <p>• شارك أدلتك بحذر وراقب الردود</p>
                  <p>• ابحث عن تناقضات في كلام الآخرين</p>
                  <p>• اسأل أسئلة مفاجئة وغير متوقعة</p>
                  <p>• لا تكشف كل معلوماتك دفعة واحدة</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-2">جاري تحميل دورك...</p>
          </div>
        )}
        {isHost && (
          <Button onClick={() => advancePhase("discussion")}
            className="w-full h-11 text-white font-bold rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
            💬 ابدأ النقاش
          </Button>
        )}
        {!isHost && <p className="text-center text-xs text-muted-foreground">⏳ بانتظار المضيف لبدء النقاش...</p>}
      </motion.div>
    );
  }

  // DISCUSSION PHASE
  if (room.phase === "discussion") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="text-center">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl">💬</motion.div>
          <h3 className="text-lg font-black text-foreground mt-2">وقت النقاش!</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ناقشوا مع بعض واكتشفوا المجرم! 🕵️
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-muted/50 text-center text-muted-foreground">💡 راجعوا الأدلة</div>
          <div className="p-2 rounded-xl bg-muted/50 text-center text-muted-foreground">🤔 اسألوا عن الأسرار</div>
          <div className="p-2 rounded-xl bg-muted/50 text-center text-muted-foreground">🎭 راقبوا ردود الفعل</div>
          <div className="p-2 rounded-xl bg-muted/50 text-center text-muted-foreground">🕵️ ابحثوا عن التناقضات</div>
        </div>

        <div className="flex justify-center">
          <ClueToggleButton />
        </div>
        <ClueReviewPanel />

        {isHost && (
          <Button onClick={() => advancePhase("voting")}
            className="w-full h-11 text-white font-bold rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
            🗳️ بدء التصويت
          </Button>
        )}
        {!isHost && <p className="text-center text-xs text-muted-foreground">⏳ بانتظار المضيف لبدء التصويت...</p>}
      </motion.div>
    );
  }

  // VOTING PHASE
  if (room.phase === "voting") {
    const hasVoted = myPlayer?.has_voted;
    const allVoted = players.every(p => p.has_voted);
    const votedCount = players.filter(p => p.has_voted).length;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-black text-foreground">🗳️ التصويت</p>
          <p className="text-xs text-muted-foreground">صوّت {votedCount}/{players.length}</p>
        </div>

        <div className="flex justify-center">
          <ClueToggleButton />
        </div>
        <ClueReviewPanel />

        {hasVoted ? (
          <div className="text-center p-6 rounded-2xl bg-muted/30">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-bold text-foreground">تم تسجيل تصويتك!</p>
            <p className="text-xs text-muted-foreground mt-1">بانتظار باقي اللاعبين... ({votedCount}/{players.length})</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center">من تعتقد أنه المجرم؟</p>
            <div className="grid grid-cols-2 gap-2">
              {players.filter(p => p.device_id !== deviceId).map(p => (
                <motion.button key={p.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => submitVote(p.player_name)}
                  className="p-3 rounded-2xl border border-border/30 bg-card hover:shadow-lg transition-all">
                  <span className="text-xl block mb-1">🤔</span>
                  <span className="text-sm font-bold text-foreground">{p.player_name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // RESULT PHASE
  if (room.phase === "result") {
    const voteCounts: Record<string, number> = {};
    players.forEach(p => { if (p.vote_target) voteCounts[p.vote_target] = (voteCounts[p.vote_target] || 0) + 1; });
    const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    const topSuspect = sorted[0]?.[0] || "";
    const isCorrect = topSuspect === gd.solution.criminal;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className="rounded-2xl p-4 border border-border/30 text-center" style={{ background: `${tc}08` }}>
          <h3 className="text-base font-black text-foreground mb-3">🗳️ نتائج التصويت</h3>
          <div className="space-y-2">
            {sorted.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground w-20 text-right">{name}</span>
                <div className="flex-1 h-6 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(count / players.length) * 100}%` }}
                    className="h-full rounded-full" style={{ background: i === 0 ? tc : `${tc}60` }} />
                </div>
                <span className="text-xs font-bold" style={{ color: tc }}>{count}</span>
              </div>
            ))}
          </div>
          <p className="text-sm font-bold mt-3 text-foreground">
            المتهم الأول: <span style={{ color: tc }}>{topSuspect}</span>
          </p>
        </div>

        {!showSolution ? (
          <Button onClick={() => setShowSolution(true)}
            className="w-full h-11 text-white font-bold rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${tc}, ${tc}bb)` }}>
            🔓 اكشف الحقيقة!
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`rounded-2xl p-4 border-2 text-center ${isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.5 }} className="text-4xl mb-2">
                {isCorrect ? "🎉" : "😱"}
              </motion.div>
              <p className="text-base font-black text-foreground">
                {isCorrect ? "أحسنتم! كشفتم المجرم!" : "المجرم أفلت! 😈"}
              </p>
              <p className="text-sm mt-2">
                المجرم الحقيقي: <span className="font-black" style={{ color: tc }}>{gd.solution.criminal}</span>
              </p>
            </div>
            <div className="rounded-2xl p-4 border border-border/30 bg-card">
              <h4 className="text-sm font-bold text-foreground mb-2">📋 التفسير الكامل</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{gd.solution.explanation}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return null;
};

export default OnlineDetectiveGame;
