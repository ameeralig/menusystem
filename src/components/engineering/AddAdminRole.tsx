
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

      if (data.success) {
        toast({
          title: 'نجاح',
          description: data.message || 'تم إضافة دور المشرف بنجاح'
        });
        setEmail('');
      } else {
        throw new Error(data.error || 'فشلت عملية إضافة المشرف');
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">إضافة دور مشرف</h2>
      <div className="flex gap-2 flex-row-reverse">
        <Button onClick={addAdminRole} disabled={loading}>
          {loading ? 'جاري الإضافة...' : 'إضافة مشرف'}
        </Button>
        <Input 
          type="email" 
          placeholder="أدخل البريد الإلكتروني" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow"
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default AddAdminRole;
