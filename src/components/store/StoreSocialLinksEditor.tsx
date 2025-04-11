
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, MessageSquare, Save } from "lucide-react";

type SocialLinks = {
  instagram: string;
  facebook: string;
  telegram: string;
};

interface StoreSocialLinksEditorProps {
  socialLinks: SocialLinks;
  handleSocialLinkChange: (platform: keyof SocialLinks) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const StoreSocialLinksEditor = ({
  socialLinks,
  handleSocialLinkChange,
  handleSubmit,
  isLoading
}: StoreSocialLinksEditorProps) => {
  return (
    <Card className="border-2 border-purple-100 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="text-right">روابط التواصل الاجتماعي</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="url"
                placeholder="رابط الإنستقرام"
                value={socialLinks.instagram}
                onChange={handleSocialLinkChange('instagram')}
                className="text-right"
                dir="rtl"
              />
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="url"
                placeholder="رابط الفيسبوك"
                value={socialLinks.facebook}
                onChange={handleSocialLinkChange('facebook')}
                className="text-right"
                dir="rtl"
              />
              <Facebook className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="url"
                placeholder="رابط التليجرام"
                value={socialLinks.telegram}
                onChange={handleSocialLinkChange('telegram')}
                className="text-right"
                dir="rtl"
              />
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            <Save className="ml-2 h-4 w-4" />
            {isLoading ? "جاري الحفظ..." : "حفظ الروابط"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StoreSocialLinksEditor;
