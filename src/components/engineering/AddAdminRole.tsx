
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

const AddAdminRole = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addAdminRole = async () => {
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء إدخال بريد إلكتروني صحيح'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-role', {
        body: { email }
      });

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: 'نجاح',
          description: data.message || 'تم إضافة دور المشرف بنجاح'
        });
        setEmail('');
      } else {
        throw new Error(data?.error || 'فشلت عملية إضافة المشرف');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة المشرف'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">إضافة مشرف جديد</h2>
      <div className="flex gap-3 flex-col md:flex-row">
        <Input 
          type="email" 
          placeholder="أدخل البريد الإلكتروني للمشرف" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow"
          dir="rtl"
        />
        <Button 
          onClick={addAdminRole} 
          disabled={loading}
          className="whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 ml-2" />
          {loading ? 'جاري الإضافة...' : 'إضافة كمشرف'}
        </Button>
      </div>
    </div>
  );
};

export default AddAdminRole;
