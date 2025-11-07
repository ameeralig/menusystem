import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { optimizeForThumbnail } from "@/utils/imageOptimization";

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
      className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-primary/30 bg-white hover:border-primary hover:shadow-primary/20"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-primary/20 group-hover:border-primary/50 transition-all duration-300 shadow-lg">
            <AvatarImage 
              src={avatarUrl ? optimizeForThumbnail(avatarUrl, 200) : undefined} 
              alt={fullName || storeName || "شريك"} 
              className="object-cover"
              loading="lazy"
            />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-black">
              {getInitials(fullName || storeName || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
        </div>
        
        <div className="text-center space-y-1">
          <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors font-arabic">
            {fullName || storeName || "مستخدم"}
          </h3>
          {storeName && fullName && fullName !== storeName && (
            <p className="text-sm text-muted-foreground font-bold font-arabic">
              {storeName}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCard;
