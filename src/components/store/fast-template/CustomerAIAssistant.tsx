import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, X, ShoppingCart, Coffee, Flame, BadgeDollarSign, Star, ChevronLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logVisitorActivity } from "@/hooks/analytics/useActivityLogger";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";
import ReactMarkdown from "react-markdown";
import { createPortal } from "react-dom";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  orderSummary?: OrderSummary;
  productCards?: ProductCardData[];
}

interface ProductCardData {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  description?: string | null;
  discount_percentage?: number | null;
  original_price?: number | null;
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

const formatPrice = (price: number) => new Intl.NumberFormat('ar-IQ').format(price);

// ===== Typing Indicator =====
const TypingIndicator = ({ assistantName }: { assistantName: string }) => (
  <div className="flex gap-3 items-start animate-fade-in">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1">
      <span className="text-xs text-muted-foreground mb-1 block">{assistantName}</span>
      <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-muted/60 backdrop-blur-sm border border-border/40 inline-block">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">جاري البحث عن أفضل المنتجات لك</span>
          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ===== Product Card inside Chat =====
const ChatProductCard = ({ product, onAddToCart, onView }: {
  product: ProductCardData;
  onAddToCart: (product: ProductCardData) => void;
  onView: (product: ProductCardData) => void;
}) => {
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/40 hover:border-violet-500/30 transition-all duration-200 group">
      {product.image_url && (
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground truncate">{product.name}</h4>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-violet-400">{formatPrice(product.price)} د.ع</span>
          {hasDiscount && product.original_price && (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">-{product.discount_percentage}%</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 justify-center flex-shrink-0">
        <button
          onClick={() => onAddToCart(product)}
          className="w-8 h-8 rounded-lg bg-violet-500/20 hover:bg-violet-500/40 flex items-center justify-center transition-colors"
          title="أضف للسلة"
        >
          <Plus className="w-4 h-4 text-violet-400" />
        </button>
      </div>
    </div>
  );
};

// ===== Quick Action Buttons =====
const QuickActions = ({ onAction }: { onAction: (text: string) => void }) => {
  const actions = [
    { icon: Coffee, label: "عرض القهوة", text: "أريد أشوف أنواع القهوة المتوفرة" },
    { icon: Flame, label: "العروض", text: "شنو العروض اللي عندكم اليوم؟" },
    { icon: BadgeDollarSign, label: "الأرخص", text: "شنو أرخص المنتجات عندكم؟" },
    { icon: Star, label: "الأفضل", text: "شنو أفضل المنتجات مبيعاً؟" },
  ];

  return (
    <div className="flex gap-2 flex-wrap justify-center px-2">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => onAction(action.text)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-sm text-violet-300 hover:text-violet-200 transition-all duration-200 active:scale-95"
        >
          <action.icon className="w-3.5 h-3.5" />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

// ===== Main Component =====
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => {
    const loadAiAssistantName = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('ai_assistant_name')
        .eq('user_id', storeOwnerId)
        .single();
      if (data?.ai_assistant_name) setAiAssistantName(data.ai_assistant_name);
    };
    loadAiAssistantName();
  }, [storeOwnerId]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const saveAiAssistantName = async () => {
    if (!tempAiName.trim()) return;
    const { error } = await supabase
      .from('store_settings')
      .update({ ai_assistant_name: tempAiName.trim() })
      .eq('user_id', storeOwnerId);
    if (!error) {
      setAiAssistantName(tempAiName.trim());
      setIsEditingAiName(false);
      toast({ title: "تم الحفظ", description: "تم حفظ اسم المساعد الذكي بنجاح" });
    }
  };

  const handleAddToCart = (product: ProductCardData) => {
    const fullProduct = products.find(p => p.id === product.id);
    if (fullProduct) {
      addItem(fullProduct, 1);
      toast({ title: "تمت الإضافة ✅", description: `تم إضافة ${product.name} للسلة` });
    }
  };

  const handleViewProduct = (product: ProductCardData) => {
    // Scroll to product in the store - could be enhanced
  };

  const sendMessage = async (overrideMessage?: string) => {
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage || isLoading) return;
    setInput("");
    setIsLoading(true);

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

      // Build product cards from returned product IDs
      let productCards: ProductCardData[] | undefined;
      if (data.productIds && Array.isArray(data.productIds)) {
        productCards = data.productIds
          .map((id: string) => products.find(p => p.id === id))
          .filter(Boolean)
          .map((p: Product) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            description: p.description,
            discount_percentage: p.discount_percentage,
            original_price: p.original_price,
          }));
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
        orderSummary: data.orderSummary,
        productCards: productCards && productCards.length > 0 ? productCards : undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.addToCart && Array.isArray(data.addToCart)) {
        data.addToCart.forEach((item: { product: Product; quantity: number }) => {
          addItem(item.product, item.quantity);
        });
        toast({ title: "تمت الإضافة", description: `تم إضافة ${data.addToCart.length} منتج للسلة` });
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
      toast({ title: "خطأ", description: "رقم الواتساب غير متوفر", variant: "destructive" });
      return;
    }
    let message = `*طلب جديد من ${storeName || 'المتجر'}*\n\n*المنتجات:*\n`;
    orderSummary.items.forEach((item, i) => {
      message += `${i + 1}. ${item.productName}\n   الكمية: ${item.quantity}\n   السعر: ${formatPrice(item.price)} د.ع\n   المجموع: ${formatPrice(item.price * item.quantity)} د.ع\n\n`;
    });
    message += `*مجموع المنتجات:* ${formatPrice(orderSummary.subtotal)} د.ع\n*مبلغ التوصيل:* ${formatPrice(orderSummary.deliveryFee)} د.ع\n*المجموع النهائي:* ${formatPrice(orderSummary.total)} د.ع\n\n`;
    message += `*بيانات الزبون:*\nالاسم: ${orderSummary.customerName}\nالهاتف: ${orderSummary.customerPhone}\nالعنوان: ${orderSummary.customerAddress}\n`;
    if (orderSummary.customerNotes) message += `ملاحظات: ${orderSummary.customerNotes}\n`;
    const cleanPhone = storePhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    toast({ title: "تم الإرسال", description: "تم إرسال الطلب إلى الواتساب" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  const chatContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background/95 backdrop-blur-xl md:inset-auto md:bottom-24 md:left-6 md:right-auto md:w-[420px] md:h-[600px] md:rounded-2xl md:border md:border-border/50 md:shadow-2xl md:shadow-violet-500/5 animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-3 border-b border-border/30 bg-gradient-to-l from-violet-500/5 via-background to-fuchsia-500/5">
        <div className="flex items-center justify-between">
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/80">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1 justify-end mr-2">
            <div className="text-right">
              {isEditingAiName && isStoreOwner ? (
                <div className="flex gap-2 items-center">
                  <Button onClick={saveAiAssistantName} size="sm" className="h-7 text-xs">حفظ</Button>
                  <Input
                    value={tempAiName}
                    onChange={(e) => setTempAiName(e.target.value)}
                    placeholder="اسم المساعد"
                    dir="rtl"
                    className="h-7 text-sm w-32"
                    onKeyPress={(e) => e.key === 'Enter' && saveAiAssistantName()}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isStoreOwner && (
                    <button
                      onClick={() => { setTempAiName(aiAssistantName); setIsEditingAiName(true); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >✏️</button>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-tight">{aiAssistantName}</h3>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">متصل الآن</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" dir="rtl">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/20 rotate-3">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-foreground font-bold text-lg">هلا حبيبي 👋</p>
              <p className="text-muted-foreground text-sm mt-1">أنا {aiAssistantName}، شتدور اليوم؟</p>
            </div>
            <QuickActions onAction={(text) => sendMessage(text)} />
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                {msg.role === 'user' ? (
                  // User message
                  <div className="flex gap-3 items-start flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 flex justify-end">
                      <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-primary text-primary-foreground max-w-[85%]">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Assistant message
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-2 max-w-[90%]">
                      <span className="text-xs text-muted-foreground">{aiAssistantName}</span>
                      <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-muted/50 backdrop-blur-sm border border-border/30">
                        <div className="text-sm prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Product Cards */}
                      {msg.productCards && msg.productCards.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {msg.productCards.map((product) => (
                            <ChatProductCard
                              key={product.id}
                              product={product}
                              onAddToCart={handleAddToCart}
                              onView={handleViewProduct}
                            />
                          ))}
                        </div>
                      )}

                      {/* Order Summary WhatsApp Button */}
                      {msg.orderSummary && (
                        <button
                          onClick={() => sendOrderToWhatsApp(msg.orderSummary!)}
                          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-l from-green-600 to-green-500 text-white font-medium text-sm hover:from-green-700 hover:to-green-600 transition-all active:scale-[0.98] shadow-lg shadow-green-500/20"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          إرسال الطلب إلى الواتساب
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Quick actions after messages */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
              <div className="pt-2">
                <QuickActions onAction={(text) => sendMessage(text)} />
              </div>
            )}

            {isLoading && <TypingIndicator assistantName={aiAssistantName} />}
          </>
        )}
      </div>

      {/* Input Bar - always visible */}
      <div className="p-3 border-t border-border/30 bg-background/80 backdrop-blur-xl safe-area-bottom">
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/20 flex-shrink-0 transition-all active:scale-90 disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك هنا..."
            disabled={isLoading}
            className="flex-1 h-10 rounded-full bg-muted/50 border-border/30 px-4 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/30"
            dir="rtl"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(chatContent, document.body);
};

export default CustomerAIAssistant;
