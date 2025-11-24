import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface CustomerAIAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string;
}

const CustomerAIAssistant = ({ isOpen, onOpenChange, storeOwnerId }: CustomerAIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const { data, error } = await supabase.functions.invoke('customer-ai-assistant', {
        body: {
          message: userMessage,
          storeOwnerId
        }
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في الاتصال بالمساعد الذكي",
        variant: "destructive"
      });

      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-24 left-6 right-6 md:left-6 md:right-6 md:w-[400px] h-[500px] z-[100] flex flex-col glass-morphism border border-white/30 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-purple-600/10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">المساعد الذكي</h3>
              <p className="text-xs text-muted-foreground">اسألني عن المنتجات والأسعار</p>
            </div>
          </div>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-foreground font-medium">مرحباً! أنا مساعدك الذكي</p>
              <p className="text-sm text-muted-foreground mt-2">يمكنني مساعدتك في:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• البحث عن المنتجات المتوفرة</li>
                <li>• معرفة الأسعار والتفاصيل</li>
                <li>• اقتراح منتجات مناسبة</li>
                <li>• الإجابة على استفساراتك</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 px-4 py-3 rounded-lg bg-muted">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/20 bg-background/30 backdrop-blur-md">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اسألني عن المنتجات..."
            disabled={isLoading}
            className="flex-1 bg-background/50"
            dir="rtl"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CustomerAIAssistant;
