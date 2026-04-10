import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Play, Eye, EyeOff, Clock, HelpCircle, AlertTriangle, Trophy, RotateCcw, Loader2, Wifi, Monitor, ChevronLeft, MessageCircle, Lightbulb, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImpostorInstructions from "./ImpostorInstructions";

interface ImpostorGameProps {
  isOpen: boolean;
  onClose: () => void;
  colorTheme?: string;
  storeOwnerId?: string;
}

type Phase = "mode_select" | "setup" | "lobby" | "loading" | "reveal" | "playing" | "voting" | "result";
type GameMode = "local" | "online";
type PlayStyle = "hints" | "questions";

const CATEGORIES = [
  { id: "funny", label: "محرج ومضحك 😂", emoji: "😂" },
  { id: "food", label: "أكلات 🍔", emoji: "🍔" },
  { id: "animals", label: "حيوانات 🐸", emoji: "🐸" },
  { id: "actions", label: "أفعال 🤭", emoji: "🤭" },
  { id: "random", label: "عشوائي 🎲", emoji: "🎲" },
];

const DURATIONS = [
  { value: 30, label: "30 ثانية ⚡" },
  { value: 60, label: "دقيقة ⏰" },
  { value: 90, label: "90 ثانية 🕐" },
  { value: 120, label: "دقيقتين 🔥" },
];

const getDeviceId = () => {
  let id = localStorage.getItem("impostor_device_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("impostor_device_id", id); }
  return id;
};

const getThemeColor = (colorTheme?: string) => {
  if (colorTheme?.startsWith("#")) return colorTheme;
  const colors: Record<string, string> = { coral: "#fb923c", purple: "#a855f7", blue: "#3b82f6", green: "#22c55e", red: "#ef4444" };
  return colors[colorTheme || ""] || "#3b82f6";
};

const ImpostorGame: React.FC<ImpostorGameProps> = ({ isOpen, onClose, colorTheme, storeOwnerId }) => {
  const [phase, setPhase] = useState<Phase>("mode_select");
  const [gameMode, setGameMode] = useState<GameMode>("local");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("hints");
  const [category, setCategory] = useState("funny");
  const [duration, setDuration] = useState(60);
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [impostorIndex, setImpostorIndex] = useState(-1);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [showWord, setShowWord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [currentVoter, setCurrentVoter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Online mode state
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [onlineName, setOnlineName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [myDeviceId] = useState(getDeviceId);
  const [onlinePhase, setOnlinePhase] = useState("waiting");
  const [myIndex, setMyIndex] = useState(-1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const themeColor = getThemeColor(colorTheme);

  // Timer logic
  useEffect(() => {
    if (phase === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
    if (phase === "playing" && timeLeft === 0) {
      setPhase("voting");
      setCurrentVoter(0);
    }
  }, [phase, timeLeft]);

  // Online: subscribe to room changes
  useEffect(() => {
    if (gameMode !== "online" || !roomId) return;
    
    const roomChannel = supabase.channel(`impostor-room-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "impostor_rooms", filter: `id=eq.${roomId}` },
        (payload: any) => {
          const data = payload.new;
          if (data) {
            setOnlinePhase(data.phase);
            if (data.secret_word) setSecretWord(data.secret_word);
            if (data.impostor_index !== null) setImpostorIndex(data.impostor_index);
            if (data.round_duration) setDuration(data.round_duration);
            if (data.game_mode) setPlayStyle(data.game_mode as PlayStyle);
            
            if (data.phase === "reveal") setPhase("reveal");
            if (data.phase === "playing") { setPhase("playing"); setTimeLeft(data.round_duration || 60); }
            if (data.phase === "voting") { setPhase("voting"); setCurrentVoter(0); }
            if (data.phase === "result") setPhase("result");
          }
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "impostor_players", filter: `room_id=eq.${roomId}` },
        () => { fetchPlayers(); })
      .subscribe();

    return () => { supabase.removeChannel(roomChannel); };
  }, [gameMode, roomId]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from("impostor_players").select("*").eq("room_id", roomId).order("player_index");
    if (data) {
      setOnlinePlayers(data);
      const me = data.find((p: any) => p.device_id === myDeviceId);
      if (me) setMyIndex(me.player_index);
    }
  };

  useEffect(() => { if (roomId) fetchPlayers(); }, [roomId]);

  const generateWord = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-impostor-word", {
        body: { category },
      });
      if (error) throw error;
      return data.word || "شاورما";
    } catch (e) {
      console.error(e);
      // Fallback words
      const fallbacks = ["شخير", "حفاضة", "قشرة", "تجشؤ", "ضراط", "بخاخ إبط", "شاورما", "فلافل"];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } finally {
      setLoading(false);
    }
  };

  // LOCAL: Start game
  const startLocalGame = async () => {
    if (players.length < 3) { toast.error("يجب إضافة 3 لاعبين على الأقل"); return; }
    setLoading(true);
    const word = await generateWord();
    setSecretWord(word);
    const idx = Math.floor(Math.random() * players.length);
    setImpostorIndex(idx);
    setCurrentRevealIndex(0);
    setShowWord(false);
    setPhase("reveal");
    setLoading(false);
  };

  // ONLINE: Create room
  const createRoom = async () => {
    if (!onlineName.trim()) { toast.error("أدخل اسمك"); return; }
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const { data, error } = await supabase.from("impostor_rooms").insert({
      room_code: code, host_device_id: myDeviceId, store_owner_id: storeOwnerId,
      game_mode: playStyle, round_duration: duration, category,
    }).select().single();
    if (error) { toast.error("خطأ في إنشاء الغرفة"); return; }
    
    await supabase.from("impostor_players").insert({
      room_id: data.id, player_name: onlineName.trim(), device_id: myDeviceId, player_index: 0,
    });
    
    setRoomId(data.id);
    setRoomCode(code);
    setIsHost(true);
    setMyIndex(0);
    setPhase("lobby");
  };

  // ONLINE: Join room
  const joinRoom = async () => {
    if (!onlineName.trim() || !joinCode.trim()) { toast.error("أدخل اسمك ورمز الغرفة"); return; }
    const { data: room } = await supabase.from("impostor_rooms").select("*").eq("room_code", joinCode.toUpperCase()).single();
    if (!room) { toast.error("الغرفة غير موجودة"); return; }
    if (room.phase !== "waiting") { toast.error("اللعبة بدأت بالفعل"); return; }

    const { data: existingPlayers } = await supabase.from("impostor_players").select("*").eq("room_id", room.id);
    const count = existingPlayers?.length || 0;
    if (count >= 10) { toast.error("الغرفة ممتلئة"); return; }

    await supabase.from("impostor_players").insert({
      room_id: room.id, player_name: onlineName.trim(), device_id: myDeviceId, player_index: count,
    });

    setRoomId(room.id);
    setRoomCode(room.room_code);
    setIsHost(false);
    setMyIndex(count);
    setPlayStyle(room.game_mode as PlayStyle);
    setDuration(room.round_duration);
    setPhase("lobby");
  };

  // ONLINE: Host starts
  const startOnlineGame = async () => {
    if (onlinePlayers.length < 3) { toast.error("يجب 3 لاعبين على الأقل"); return; }
    setLoading(true);
    const word = await generateWord();
    const idx = Math.floor(Math.random() * onlinePlayers.length);
    
    await supabase.from("impostor_rooms").update({
      phase: "reveal", secret_word: word, impostor_index: idx,
      game_mode: playStyle, round_duration: duration,
    }).eq("id", roomId);
    setLoading(false);
  };

  const advanceToPlaying = async () => {
    if (gameMode === "local") {
      setPhase("playing");
      setTimeLeft(duration);
    } else if (isHost) {
      await supabase.from("impostor_rooms").update({ phase: "playing" }).eq("id", roomId);
    }
  };

  const startVoting = async () => {
    if (gameMode === "local") {
      setPhase("voting");
      setCurrentVoter(0);
    } else if (isHost) {
      await supabase.from("impostor_rooms").update({ phase: "voting" }).eq("id", roomId);
    }
  };

  // Vote logic (local)
  const castVote = (voterIdx: number, targetIdx: number) => {
    setVotes(prev => ({ ...prev, [voterIdx]: targetIdx }));
    const playerList = gameMode === "local" ? players : onlinePlayers.map((p: any) => p.player_name);
    if (voterIdx + 1 < playerList.length) {
      setCurrentVoter(voterIdx + 1);
    } else {
      setPhase("result");
      if (gameMode === "online" && isHost) {
        supabase.from("impostor_rooms").update({ phase: "result" }).eq("id", roomId);
      }
    }
  };

  const getVoteResults = () => {
    const counts: Record<number, number> = {};
    Object.values(votes).forEach(target => { counts[target] = (counts[target] || 0) + 1; });
    let maxVotes = 0, suspected = -1;
    Object.entries(counts).forEach(([idx, count]) => {
      if (count > maxVotes) { maxVotes = count; suspected = parseInt(idx); }
    });
    return { suspected, maxVotes, counts };
  };

  const resetGame = () => {
    setPhase("mode_select");
    setPlayers([]);
    setSecretWord("");
    setImpostorIndex(-1);
    setCurrentRevealIndex(-1);
    setShowWord(false);
    setTimeLeft(0);
    setVotes({});
    setCurrentVoter(0);
    setRoomId("");
    setRoomCode("");
    setOnlinePlayers([]);
  };

  const addPlayer = () => {
    if (!newPlayer.trim()) return;
    if (players.length >= 10) { toast.error("الحد الأقصى 10 لاعبين"); return; }
    setPlayers(prev => [...prev, newPlayer.trim()]);
    setNewPlayer("");
  };

  if (!isOpen) return null;

  const playerList = gameMode === "local" ? players : onlinePlayers.map((p: any) => p.player_name);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
        
        <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 28 }}
          className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-background shadow-2xl overflow-hidden border border-border/30"
          style={{ direction: "rtl" }}>
          
          {/* Header */}
          <div className="relative p-4 text-white overflow-hidden" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}>
            <motion.div animate={{ y: [-3, 3, -3], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}
              className="absolute top-2 left-8 text-2xl opacity-20">🕵️</motion.div>
            <motion.div animate={{ y: [3, -3, 3] }} transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute bottom-1 left-20 text-xl opacity-15">❓</motion.div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {phase !== "mode_select" && (
                  <button onClick={() => phase === "lobby" ? setPhase("mode_select") : resetGame()}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-black">🕵️ الامبوستر</h2>
                  <p className="text-[10px] text-white/60">اكتشف من هو الدخيل!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowInstructions(true)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                  <HelpCircle className="h-4 w-4" />
                </button>
                <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[65vh] overflow-y-auto space-y-4">
            
            {/* Mode Select */}
            {phase === "mode_select" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="text-center text-sm text-muted-foreground font-medium">اختر طريقة اللعب</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: "local" as GameMode, icon: Monitor, label: "محلي", desc: "جهاز واحد", emoji: "📱" },
                    { mode: "online" as GameMode, icon: Wifi, label: "أونلاين", desc: "عدة أجهزة", emoji: "🌐" },
                  ].map(m => (
                    <motion.button key={m.mode} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setGameMode(m.mode); setPhase("setup"); }}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-border/30 bg-card hover:shadow-lg transition-all">
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="font-bold text-sm">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{m.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Setup */}
            {phase === "setup" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Play Style */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">طريقة اللعب</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "hints" as PlayStyle, label: "تلميحات", icon: Lightbulb, desc: "كل لاعب يعطي تلميح" },
                      { id: "questions" as PlayStyle, label: "أسئلة", icon: MessageCircle, desc: "اسأل شخص معين" },
                    ].map(s => (
                      <button key={s.id} onClick={() => setPlayStyle(s.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${playStyle === s.id ? "border-primary bg-primary/10" : "border-border/30"}`}>
                        <s.icon className="h-5 w-5 mx-auto mb-1" style={playStyle === s.id ? { color: themeColor } : {}} />
                        <p className="text-xs font-bold">{s.label}</p>
                        <p className="text-[9px] text-muted-foreground">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">فئة الكلمات</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => setCategory(c.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${category === c.id ? "text-white" : "border-border/30"}`}
                        style={category === c.id ? { background: themeColor, borderColor: themeColor } : {}}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">مدة الجولة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DURATIONS.map(d => (
                      <button key={d.value} onClick={() => setDuration(d.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${duration === d.value ? "text-white" : "border-border/30"}`}
                        style={duration === d.value ? { background: themeColor, borderColor: themeColor } : {}}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {gameMode === "local" ? (
                  /* Local: add players */
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-2 block">اللاعبين ({players.length}/10)</label>
                    <div className="flex gap-2 mb-2">
                      <Input value={newPlayer} onChange={e => setNewPlayer(e.target.value)} placeholder="اسم اللاعب"
                        onKeyDown={e => e.key === "Enter" && addPlayer()} className="text-sm" />
                      <Button size="sm" onClick={addPlayer} style={{ background: themeColor }}>+</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {players.map((p, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-muted flex items-center gap-1">
                          {p}
                          <button onClick={() => setPlayers(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-destructive hover:text-destructive/80 ml-1">×</button>
                        </span>
                      ))}
                    </div>
                    <Button onClick={startLocalGame} disabled={players.length < 3 || loading}
                      className="w-full mt-3 text-white font-bold" style={{ background: themeColor }}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "🎮 ابدأ اللعبة"}
                    </Button>
                  </div>
                ) : (
                  /* Online: name + create/join */
                  <div className="space-y-3">
                    <Input value={onlineName} onChange={e => setOnlineName(e.target.value)} placeholder="اسمك" className="text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={createRoom} className="text-white font-bold text-xs" style={{ background: themeColor }}>
                        🏠 إنشاء غرفة
                      </Button>
                      <div className="flex gap-1">
                        <Input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="الرمز" className="text-xs" />
                        <Button onClick={joinRoom} variant="outline" size="sm" className="text-xs shrink-0">انضم</Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Lobby (Online) */}
            {phase === "lobby" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">رمز الغرفة</p>
                  <p className="text-3xl font-black tracking-[0.3em]" style={{ color: themeColor }}>{roomCode}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">شارك الرمز مع أصدقائك</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold mb-2">اللاعبين ({onlinePlayers.length})</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {onlinePlayers.map((p: any, i: number) => (
                      <span key={p.id} className="px-3 py-1.5 rounded-full text-xs font-bold" 
                        style={{ background: `${themeColor}20`, color: themeColor }}>
                        {i === 0 ? "👑 " : ""}{p.player_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🎯 الطريقة: {playStyle === "hints" ? "تلميحات" : "أسئلة"}</p>
                  <p>⏰ المدة: {duration} ثانية</p>
                  <p>📂 الفئة: {CATEGORIES.find(c => c.id === category)?.label}</p>
                </div>

                {isHost && (
                  <Button onClick={startOnlineGame} disabled={onlinePlayers.length < 3 || loading}
                    className="w-full text-white font-bold" style={{ background: themeColor }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `🚀 ابدأ (${onlinePlayers.length} لاعبين)`}
                  </Button>
                )}
                {!isHost && <p className="text-xs text-muted-foreground animate-pulse">⏳ بانتظار المضيف...</p>}
              </motion.div>
            )}

            {/* Reveal Phase */}
            {phase === "reveal" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                {gameMode === "local" ? (
                  // Local: pass phone around
                  <>
                    <div className="p-3 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground">مرر الهاتف إلى</p>
                      <p className="text-lg font-black mt-1" style={{ color: themeColor }}>{players[currentRevealIndex]}</p>
                    </div>

                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => setShowWord(!showWord)}
                      className="w-full p-6 rounded-2xl border-2 border-dashed border-border/50 bg-card">
                      {showWord ? (
                        <div>
                          {currentRevealIndex === impostorIndex ? (
                            <div className="space-y-2">
                              <span className="text-4xl">🕵️</span>
                              <p className="text-lg font-black text-destructive">أنت الامبوستر!</p>
                              <p className="text-xs text-muted-foreground">حاول تخمين الكلمة من تلميحات الآخرين</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span className="text-4xl">✅</span>
                              <p className="text-xs text-muted-foreground">الكلمة هي:</p>
                              <p className="text-2xl font-black" style={{ color: themeColor }}>{secretWord}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Eye className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm font-bold text-muted-foreground">اضغط لكشف دورك</p>
                          <p className="text-[10px] text-muted-foreground">تأكد أنك وحدك تشاهد</p>
                        </div>
                      )}
                    </motion.button>

                    {showWord && (
                      <Button onClick={() => {
                        setShowWord(false);
                        if (currentRevealIndex + 1 < players.length) {
                          setCurrentRevealIndex(currentRevealIndex + 1);
                        } else {
                          advanceToPlaying();
                        }
                      }} className="w-full text-white font-bold" style={{ background: themeColor }}>
                        {currentRevealIndex + 1 < players.length ? "➡️ اللاعب التالي" : "🎮 ابدأ الجولة"}
                      </Button>
                    )}
                  </>
                ) : (
                  // Online: show your own role
                  <div className="space-y-4">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-6 rounded-2xl border-2 border-border/30 bg-card">
                      {myIndex === impostorIndex ? (
                        <div className="space-y-3">
                          <span className="text-5xl block">🕵️</span>
                          <p className="text-xl font-black text-destructive">أنت الامبوستر!</p>
                          <p className="text-xs text-muted-foreground">لا تعرف الكلمة. حاول التخمين من تلميحات الآخرين وتصرف بطبيعية!</p>
                          <div className="mt-3 p-2 rounded-lg bg-destructive/10 text-xs">
                            <p className="font-bold text-destructive">💡 نصائح:</p>
                            <ul className="text-muted-foreground mt-1 space-y-1 text-right">
                              <li>• أعطِ تلميحات عامة جداً</li>
                              <li>• راقب ردود فعل الآخرين</li>
                              <li>• لا تكن أول من يعطي تلميح</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <span className="text-5xl block">✅</span>
                          <p className="text-xs text-muted-foreground">الكلمة السرية هي:</p>
                          <p className="text-3xl font-black" style={{ color: themeColor }}>{secretWord}</p>
                          <div className="mt-3 p-2 rounded-lg bg-primary/10 text-xs">
                            <p className="font-bold" style={{ color: themeColor }}>💡 نصائح:</p>
                            <ul className="text-muted-foreground mt-1 space-y-1 text-right">
                              <li>• أعطِ تلميحات تدل على الكلمة لكن بدون فضحها</li>
                              <li>• راقب من يعطي تلميحات غامضة</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </motion.div>
                    {isHost && (
                      <Button onClick={advanceToPlaying} className="w-full text-white font-bold" style={{ background: themeColor }}>
                        🎮 ابدأ الجولة
                      </Button>
                    )}
                    {!isHost && <p className="text-xs text-muted-foreground animate-pulse">⏳ بانتظار المضيف لبدء الجولة...</p>}
                  </div>
                )}
              </motion.div>
            )}

            {/* Playing Phase */}
            {phase === "playing" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                {/* Timer */}
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                    <circle cx="48" cy="48" r="42" fill="none" stroke={themeColor} strokeWidth="4"
                      strokeDasharray={264} strokeDashoffset={264 - (264 * timeLeft / duration)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? "text-destructive animate-pulse" : ""}`}>
                      {timeLeft}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                  {playStyle === "hints" ? (
                    <div className="space-y-2">
                      <Lightbulb className="h-6 w-6 mx-auto" style={{ color: themeColor }} />
                      <p className="text-sm font-bold">وقت التلميحات!</p>
                      <p className="text-xs text-muted-foreground">كل لاعب يعطي تلميح عن الكلمة بالدور</p>
                      <p className="text-[10px] text-muted-foreground">الامبوستر لا يعرف الكلمة - سيحاول التظاهر!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <MessageCircle className="h-6 w-6 mx-auto" style={{ color: themeColor }} />
                      <p className="text-sm font-bold">وقت الأسئلة!</p>
                      <p className="text-xs text-muted-foreground">وجّه سؤالاً لأي لاعب عن الكلمة</p>
                      <p className="text-[10px] text-muted-foreground">اسأل أسئلة ذكية لكشف الامبوستر!</p>
                    </div>
                  )}
                </div>

                {(gameMode === "local" || isHost) && (
                  <Button onClick={startVoting} variant="outline" className="w-full font-bold border-2"
                    style={{ borderColor: themeColor, color: themeColor }}>
                    <Vote className="h-4 w-4 ml-2" /> انتقل للتصويت
                  </Button>
                )}
              </motion.div>
            )}

            {/* Voting Phase */}
            {phase === "voting" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground">🗳️ دور التصويت</p>
                  <p className="text-lg font-black" style={{ color: themeColor }}>
                    {gameMode === "local" ? players[currentVoter] : "صوّت الآن"}
                  </p>
                  {gameMode === "local" && <p className="text-[10px] text-muted-foreground">من تعتقد أنه الامبوستر؟</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {playerList.map((name: string, i: number) => {
                    if (gameMode === "local" && i === currentVoter) return null;
                    return (
                      <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
                        onClick={() => castVote(gameMode === "local" ? currentVoter : myIndex, i)}
                        className="p-3 rounded-xl border-2 border-border/30 bg-card hover:shadow-md transition-all">
                        <p className="text-sm font-bold">{name}</p>
                        <p className="text-[10px] text-muted-foreground">اختر</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Result Phase */}
            {phase === "result" && (() => {
              const { suspected, counts } = getVoteResults();
              const impostorName = playerList[impostorIndex];
              const suspectedName = playerList[suspected] || "لا أحد";
              const caught = suspected === impostorIndex;
              return (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.5 }}>
                    <span className="text-6xl block">{caught ? "🎉" : "😈"}</span>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-black" style={{ color: caught ? "#22c55e" : "#ef4444" }}>
                      {caught ? "تم القبض على الامبوستر!" : "الامبوستر نجا! 😎"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      الامبوستر كان: <span className="font-bold text-foreground">{impostorName}</span>
                    </p>
                    {!caught && (
                      <p className="text-sm text-muted-foreground">
                        اتهمتم: <span className="font-bold text-foreground">{suspectedName}</span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs font-bold mb-1">الكلمة السرية كانت:</p>
                    <p className="text-2xl font-black" style={{ color: themeColor }}>{secretWord}</p>
                  </div>

                  {/* Vote breakdown */}
                  <div className="p-3 rounded-xl bg-muted/30 text-right">
                    <p className="text-xs font-bold mb-2">نتائج التصويت:</p>
                    {playerList.map((name: string, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <span className="font-medium">{name} {i === impostorIndex ? "🕵️" : ""}</span>
                        <span className="font-bold" style={{ color: themeColor }}>{counts[i] || 0} أصوات</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={resetGame} className="w-full text-white font-bold" style={{ background: themeColor }}>
                    <RotateCcw className="h-4 w-4 ml-2" /> العب مرة أخرى
                  </Button>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      </motion.div>

      {/* Instructions Modal */}
      <ImpostorInstructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} themeColor={themeColor} />
    </AnimatePresence>
  );
};

export default ImpostorGame;
