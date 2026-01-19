// كشف مصدر الصورة من الرابط
export type ImageSource = 'r2' | 'supabase' | 'cloudinary' | 'external' | 'unknown';

export const detectImageSource = (imageUrl: string | null | undefined): ImageSource => {
  if (!imageUrl) return 'unknown';
  
  // Cloudflare R2
  if (
    imageUrl.includes('r2.dev') || 
    imageUrl.includes('r2.cloudflarestorage.com') ||
    imageUrl.includes('pub-f762a7c5308344b585c3cfbe0057fae2')
  ) {
    return 'r2';
  }
  
  // Supabase Storage
  if (
    imageUrl.includes('supabase.co/storage') ||
    imageUrl.includes('zqlckixwpyrwdwrsuhsg')
  ) {
    return 'supabase';
  }
  
  // Cloudinary
  if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary')) {
    return 'cloudinary';
  }
  
  // روابط خارجية أخرى
  if (imageUrl.startsWith('http')) {
    return 'external';
  }
  
  return 'unknown';
};

export const getImageSourceLabel = (source: ImageSource): string => {
  switch (source) {
    case 'r2':
      return 'R2';
    case 'supabase':
      return 'Supabase';
    case 'cloudinary':
      return 'Cloudinary';
    case 'external':
      return 'خارجي';
    default:
      return 'غير معروف';
  }
};

export const getImageSourceColor = (source: ImageSource): string => {
  switch (source) {
    case 'r2':
      return 'bg-orange-500';
    case 'supabase':
      return 'bg-green-500';
    case 'cloudinary':
      return 'bg-blue-500';
    case 'external':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};
