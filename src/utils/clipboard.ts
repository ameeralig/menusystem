import { toast } from "@/hooks/use-toast";

export const checkClipboardPermission = async (): Promise<boolean> => {
  try {
    // Check if clipboard API is available
    if (!navigator.clipboard) {
      toast({
        title: "تنبيه",
        description: "المتصفح لا يسمح بالنسخ التلقائي، يرجى النسخ يدويًا.",
        variant: "destructive",
      });
      return false;
    }

    // For iOS devices, show specific message
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      toast({
        title: "تنبيه",
        description: "قد لا يعمل النسخ التلقائي على بعض أجهزة iOS. في حال الفشل، يرجى النسخ يدويًا.",
        duration: 5000,
      });
    }

    return true;
  } catch (error) {
    console.error("Clipboard permission check error:", error);
    return false;
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (!await checkClipboardPermission()) {
      return false;
    }

    await navigator.clipboard.writeText(text);
    
    toast({
      title: "تم النسخ بنجاح!",
      description: "يمكنك الآن لصق النص في أي مكان",
      duration: 3000,
    });
    
    return true;
  } catch (error) {
    console.error("Copy error:", error);
    toast({
      title: "تعذر النسخ",
      description: "يرجى النسخ يدويًا: " + text,
      variant: "destructive",
      duration: 5000,
    });
    return false;
  }
};