interface AuthError {
  message: string;
  status?: number;
}

export const getErrorMessage = (error: AuthError): string => {
  if (error.message.includes('Invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني';
  }
  if (error.message.includes('Rate limit')) {
    return 'عدد محاولات تسجيل الدخول تجاوز الحد المسموح به. يرجى المحاولة لاحقاً';
  }
  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى';
};