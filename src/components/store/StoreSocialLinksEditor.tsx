
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, SendHorizonal } from "lucide-react";

interface StoreSocialLinksEditorProps {
  instagram: string;
  setInstagram: (value: string) => void;
  facebook: string;
  setFacebook: (value: string) => void;
  telegram: string;
  setTelegram: (value: string) => void;
  isEditing: boolean;
}

const StoreSocialLinksEditor = ({
  instagram,
  setInstagram,
  facebook,
  setFacebook,
  telegram,
  setTelegram,
  isEditing
}: StoreSocialLinksEditorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Instagram className="h-5 w-5 text-pink-500" />
        <Input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="رابط انستغرام"
          className="text-right"
          disabled={!isEditing}
        />
      </div>
      <div className="flex items-center gap-3">
        <Facebook className="h-5 w-5 text-blue-500" />
        <Input
          type="text"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="رابط فيسبوك"
          className="text-right"
          disabled={!isEditing}
        />
      </div>
      <div className="flex items-center gap-3">
        <SendHorizonal className="h-5 w-5 text-blue-400" />
        <Input
          type="text"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="رابط تيليجرام"
          className="text-right"
          disabled={!isEditing}
        />
      </div>
    </div>
  );
};

export default StoreSocialLinksEditor;
