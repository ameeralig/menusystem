
export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  telegram?: string;
}

export interface ContactInfo {
  description?: string;
  address?: string;
  phone?: string;
  wifi?: string;
  businessHours?: string;
}

export interface FontSettings {
  storeName: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  categoryText: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
  generalText: {
    family: string;
    isCustom: boolean;
    customFontUrl: string | null;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
