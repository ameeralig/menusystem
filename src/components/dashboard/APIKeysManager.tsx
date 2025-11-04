import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface APIKey {
  id: string;
  name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export const APIKeysManager = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل مفاتيح API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = () => {
    return 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم للمفتاح",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiKey = generateAPIKey();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: newKeyName,
          api_key: apiKey,
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء مفتاح API جديد",
      });

      setNewKeyName("");
      setIsDialogOpen(false);
      fetchAPIKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء مفتاح API",
        variant: "destructive",
      });
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف مفتاح API",
      });

      fetchAPIKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف مفتاح API",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ المفتاح إلى الحافظة",
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 10) + '••••••••••••••••••••••••';
  };

  if (loading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">مفاتيح API</h2>
          <p className="text-muted-foreground">إدارة مفاتيح الوصول للـ API الخاص بك</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء مفتاح جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مفتاح API جديد</DialogTitle>
              <DialogDescription>
                أدخل اسماً مميزاً للمفتاح لتسهيل التعرف عليه
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="مثال: مفتاح التطبيق الرئيسي"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={createAPIKey}>إنشاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">لا توجد مفاتيح API حتى الآن</p>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{key.name}</CardTitle>
                    <CardDescription>
                      تم الإنشاء: {new Date(key.created_at).toLocaleDateString('ar-SA')}
                      {key.last_used_at && (
                        <> • آخر استخدام: {new Date(key.last_used_at).toLocaleDateString('ar-SA')}</>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAPIKey(key.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    value={visibleKeys.has(key.id) ? key.api_key : maskKey(key.api_key)}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility(key.id)}
                  >
                    {visibleKeys.has(key.id) ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(key.api_key)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مثال على الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">إضافة منتج:</h4>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto" dir="ltr">
{`fetch('${import.meta.env.VITE_SUPABASE_URL}/functions/v1/store-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    action: 'product_add',
    data: {
      name: 'منتج جديد',
      price: 100,
      category: 'فئة',
      description: 'وصف المنتج'
    }
  })
})`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">الدردشة مع المساعد:</h4>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto" dir="ltr">
{`fetch('${import.meta.env.VITE_SUPABASE_URL}/functions/v1/store-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    action: 'chat',
    data: {
      message: 'كيف يمكنني تحسين مبيعات متجري؟'
    }
  })
})`}
            </pre>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              <strong>الإجراءات المتاحة:</strong><br/>
              • product_add, product_update, product_delete, product_list<br/>
              • category_add, category_update, category_delete, category_list<br/>
              • chat
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
