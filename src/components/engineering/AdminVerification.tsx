
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AdminVerificationProps {
  onVerified: () => void;
}

const AdminVerification = ({ onVerified }: AdminVerificationProps) => {
  const [code, setCode] = useState('');
  const { toast } = useToast();

  const handleVerification = () => {
    if (code === '200416') {
      localStorage.setItem('eng_verified', 'true');
      onVerified();
    } else {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرمز غير صحيح'
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-bold">صفحة المبرمج</h1>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-right block">أدخل رمز التحقق</label>
            <Input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="******"
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>
          <Button 
            onClick={handleVerification}
            className="w-full"
          >
            تحقق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminVerification;
