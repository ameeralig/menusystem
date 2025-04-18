
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

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  telegram?: string;
}

export interface ContactInfo {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  wifi?: string | null;
  businessHours?: string | null;
}

export interface StoreData {
  store_name: string | null;
  color_theme: string | null;
  banner_url: string | null;
  social_links: SocialLinks;
  contact_info: ContactInfo;
  font_settings: FontSettings;
  slug: string | null;
  custom_domain: string | null;
}
