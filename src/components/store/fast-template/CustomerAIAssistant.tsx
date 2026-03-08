import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles, User, X, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  orderSummary?: OrderSummary;
}

interface OrderSummary {
  items: Array<{ productName: string; quantity: number; price: number }>;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

interface CustomerAIAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  storeOwnerId: string;
  products: Product[];
  externalOrdersEnabled: boolean;
  deliveryFee: number;
  storePhone?: string;
  storeName?: string;
  isStoreOwner?: boolean;
}

const CustomerAIAssistant = ({ 
  isOpen, 
  onOpenChange, 
  storeOwnerId, 
  products,
  externalOrdersEnabled,
  deliveryFee,
  storePhone,
  storeName,
  isStoreOwner = false
}: CustomerAIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiAssistantName, setAiAssistantName] = useState("المساعد الذكي");
  const [isEditingAiName, setIsEditingAiName] = useState(false);
  const [tempAiName, setTempAiName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addItem } = useCart();

  // تحميل اسم المساعد الذكي من الإعدادات
  useEffect(() => {
    const loadAiAssistantName = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('ai_assistant_name')
        .eq('user_id', storeOwnerId)
        .single();
      
      if (data?.ai_assistant_name) {
        setAiAssistantName(data.ai_assistant_name);
      }
    };
    loadAiAssistantName();
  }, [storeOwnerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const saveAiAssistantName = async () => {
    if (!tempAiName.trim()) return;
    
    const { error } = await supabase
      .from('store_settings')
      .update({ ai_assistant_name: tempAiName.trim() })
      .eq('user_id', storeOwnerId);
    
    if (!error) {
      setAiAssistantName(tempAiName.trim());
      setIsEditingAiName(false);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ اسم المساعد الذكي بنجاح"
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل حفظ اسم المساعد",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // تسجيل نشاط استخدام المساعد الذكي
    if (!isStoreOwner) {
      logVisitorActivity(storeOwnerId, 'ai_chat', { 
        action: 'message_sent',
        message_preview: userMessage.substring(0, 50)
      });
    }

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
          storeOwnerId,
          externalOrdersEnabled,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
        orderSummary: data.orderSummary
      };
      setMessages(prev => [...prev, assistantMsg]);

      // إذا كان هناك منتجات لإضافتها للسلة
      if (data.addToCart && Array.isArray(data.addToCart)) {
        data.addToCart.forEach((item: { product: Product; quantity: number }) => {
          addItem(item.product, item.quantity);
        });
        toast({
          title: "تمت الإضافة",
          description: `تم إضافة ${data.addToCart.length} منتج للسلة`
        });
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

  const sendOrderToWhatsApp = (orderSummary: OrderSummary) => {
    if (!storePhone) {
      toast({
        title: "خطأ",
        description: "رقم الواتساب غير متوفر",
        variant: "destructive"
      });
      return;
    }

    const formatPrice = (price: number) => new Intl.NumberFormat('ar-IQ').format(price);

    let message = `*طلب جديد من ${storeName || 'المتجر'}*\n\n`;
    message += `*المنتجات:*\n`;
    
    orderSummary.items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${formatPrice(item.price)} د.ع\n`;
      message += `   المجموع: ${formatPrice(item.price * item.quantity)} د.ع\n\n`;
    });

    message += `*مجموع المنتجات:* ${formatPrice(orderSummary.subtotal)} د.ع\n`;
    message += `*مبلغ التوصيل:* ${formatPrice(orderSummary.deliveryFee)} د.ع\n`;
    message += `*المجموع النهائي:* ${formatPrice(orderSummary.total)} د.ع\n\n`;
    
    message += `*بيانات الزبون:*\n`;
    message += `الاسم: ${orderSummary.customerName}\n`;
    message += `الهاتف: ${orderSummary.customerPhone}\n`;
    message += `العنوان: ${orderSummary.customerAddress}\n`;
    
    if (orderSummary.customerNotes) {
      message += `ملاحظات: ${orderSummary.customerNotes}\n`;
    }

    const cleanPhone = storePhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast({
      title: "تم الإرسال",
      description: "تم إرسال الطلب إلى الواتساب"
    });
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
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              {isEditingAiName && isStoreOwner ? (
                <div className="flex gap-2">
                  <Input
                    value={tempAiName}
                    onChange={(e) => setTempAiName(e.target.value)}
                    placeholder="اسم المساعد"
                    dir="rtl"
                    className="h-8 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && saveAiAssistantName()}
                  />
                  <Button onClick={saveAiAssistantName} size="sm" className="h-8">
                    حفظ
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{aiAssistantName}</h3>
                    {isStoreOwner && (
                      <Button
                        onClick={() => {
                          setTempAiName(aiAssistantName);
                          setIsEditingAiName(true);
                        }}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <span className="text-xs">✏️</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">اسألني عن المنتجات والأسعار</p>
                </>
              )}
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
              <p className="text-foreground font-medium">مرحباً! أنا {aiAssistantName}</p>
              <p className="text-sm text-muted-foreground mt-2">يمكنني مساعدتك في:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• البحث عن المنتجات المتوفرة</li>
                <li>• معرفة الأسعار والتفاصيل</li>
                <li>• اقتراح منتجات مناسبة</li>
                {externalOrdersEnabled && (
                  <>
                    <li>• إتمام الطلب برسالة واحدة مثل:</li>
                    <li className="text-xs text-primary/80 italic">"أريد X عدد 2 وموقعي Y ورقمي 077..."</li>
                  </>
                )}
                <li>• الإجابة على استفساراتك</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
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
                    {msg.orderSummary && (
                      <Button
                        onClick={() => sendOrderToWhatsApp(msg.orderSummary!)}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700"
                      >
                        <ShoppingCart className="w-4 h-4 ml-2" />
                        إرسال الطلب إلى الواتساب
                      </Button>
                    )}
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
            placeholder="اكتب رسالتك هنا..."
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
