
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const AddAdminRole = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const addAdminRole = async () => {
    try {
      // التحقق من وجود المستخدم أولاً
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'المستخدم غير موجود'
        });
        return;
      }

      // إضافة دور المشرف
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userData.id, 
          role: 'admin' 
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: 'نجاح',
        description: 'تم إضافة دور المشرف بنجاح'
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">إضافة دور مشرف</h2>
      <div className="flex space-x-2">
        <Input 
          type="email" 
          placeholder="أدخل البريد الإلكتروني" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={addAdminRole}>
          إضافة مشرف
        </Button>
      </div>
    </div>
  );
};

export default AddAdminRole;
