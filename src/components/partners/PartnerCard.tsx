import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface PartnerCardProps {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  storeName: string | null;
  slug: string | null;
}

const PartnerCard = ({ userId, fullName, avatarUrl, storeName, slug }: PartnerCardProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleClick = () => {
    if (slug) {
      navigate(`/${slug}`);
    }
  };

  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:border-primary/50 hover:shadow-[hsl(var(--cyber-blue))]/40"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-[hsl(var(--cyber-blue))]/20 group-hover:border-[hsl(var(--cyber-blue))]/50 transition-all duration-300 shadow-xl shadow-[hsl(var(--cyber-purple))]/30">
            <AvatarImage 
              src={avatarUrl ? `${avatarUrl}?t=${Date.now()}` : undefined} 
              alt={fullName || storeName || "شريك"} 
              className="object-cover"
            />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-[hsl(var(--cyber-blue))]/30 to-[hsl(var(--cyber-purple))]/20 text-white font-black">
              {getInitials(fullName || storeName || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-[hsl(var(--cyber-blue))]/0 group-hover:bg-[hsl(var(--cyber-blue))]/20 transition-all duration-300" />
        </div>
        
        <div className="text-center space-y-1">
          <h3 className="font-black text-lg text-white group-hover:text-[hsl(var(--cyber-blue))] transition-colors drop-shadow-[0_2px_10px_rgba(255,255,255,0.6)] font-arabic">
            {fullName || storeName || "مستخدم"}
          </h3>
          {storeName && fullName && fullName !== storeName && (
            <p className="text-sm text-white/80 font-bold drop-shadow-lg font-arabic">
              {storeName}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCard;
