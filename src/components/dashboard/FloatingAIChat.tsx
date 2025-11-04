import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  image_url?: string;
}

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadLatestConversation();
    }
  }, [isOpen]);

  const loadLatestConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const convId = conversations[0].id;
        setConversationId(convId);

        const { data: msgs } = await supabase
          .from('ai_messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (msgs) {
          const validMessages = msgs
            .filter(m => m.role !== 'system')
            .map(m => {
              const metadata = m.metadata as { image_url?: string } | null;
              return {
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                created_at: m.created_at,
                image_url: metadata?.image_url
              };
            });
          setMessages(validMessages);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ",
          description: "حجم الصورة يجب أن لا يتجاوز 5 ميجابايت",
          variant: "destructive"
        });
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = input.trim() || "صورة المنتج";
    setInput("");
    setIsLoading(true);

    let imageUrl: string | null = null;
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
      setSelectedImage(null);
      setPreviewUrl(null);
    }

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      image_url: imageUrl || undefined
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-product-assistant', {
        body: {
          message: userMessage,
          conversationId,
          imageUrl
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

      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async () => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setMessages([]);
      setConversationId(null);
      toast({
        title: "تم الحذف",
        description: "تم حذف المحادثة بنجاح"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المحادثة",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-44 left-4 z-40 h-14 w-14 rounded-full glass-morphism border border-white/30 hover:border-white/50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
          size="icon"
        >
          <Bot className="h-6 w-6 text-primary" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] h-[600px] z-50 flex flex-col glass-morphism border border-white/30 shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/20 bg-background/30 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">المساعد الذكي</h3>
                  <p className="text-xs text-muted-foreground">مساعدك لإدارة المنتجات</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    onClick={deleteConversation}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
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
                  <p className="text-sm text-muted-foreground mt-2">يمكنني مساعدتك في:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• إضافة منتجات جديدة</li>
                    <li>• تعديل المنتجات الموجودة</li>
                    <li>• حذف المنتجات</li>
                    <li>• رفع صور المنتجات</li>
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
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
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
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="صورة المنتج"
                          className="mt-2 rounded-lg max-w-[200px] border border-border"
                        />
                      )}
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
          <div className="p-4 border-t border-white/20 bg-background/30 backdrop-blur-md">
            {previewUrl && (
              <div className="mb-2 relative inline-block">
                <img src={previewUrl} alt="معاينة" className="h-20 w-20 object-cover rounded-lg border border-border" />
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                  }}
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                size="icon"
                variant="outline"
                className="flex-shrink-0"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                className="flex-1 bg-background/50"
                dir="rtl"
              />
              <Button
                onClick={sendMessage}
                disabled={(!input.trim() && !selectedImage) || isLoading}
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
      )}
    </>
  );
};

export default FloatingAIChat;
