import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversation on mount
  useEffect(() => {
    loadLatestConversation();
  }, []);

  const loadLatestConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get latest conversation
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const convId = conversations[0].id;
        setConversationId(convId);

        // Load messages
        const { data: msgs } = await supabase
          .from('ai_messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (msgs) {
          const validMessages = msgs
            .filter(m => m.role !== 'system')
            .map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              created_at: m.created_at
            }));
          setMessages(validMessages);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-product-assistant', {
        body: {
          message: userMessage,
          conversationId
        }
      });

      if (error) throw error;

      // Add assistant response
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Update conversation ID
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في الاتصال بالمساعد الذكي",
        variant: "destructive"
      });

      // Remove the user message on error
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

  return (
    <Card className="flex flex-col h-[600px] bg-background border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">المساعد الذكي</h3>
            <p className="text-sm text-muted-foreground">
              مساعدك لإدارة المنتجات
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <Bot className="w-16 h-16 text-muted-foreground/50" />
            <div>
              <p className="text-foreground font-medium">مرحباً! أنا مساعدك الذكي</p>
              <p className="text-sm text-muted-foreground mt-2">
                يمكنني مساعدتك في:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• إضافة منتجات جديدة</li>
                <li>• تعديل المنتجات الموجودة</li>
                <li>• حذف المنتجات</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4 text-muted-foreground" />
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
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            disabled={isLoading}
            className="flex-1 bg-background"
            dir="rtl"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
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

export default AIAssistant;