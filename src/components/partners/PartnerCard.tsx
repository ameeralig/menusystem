import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <div className="relative p-4 sm:p-5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
        {/* خلفية متوهجة */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white/10 group-hover:border-cyan-500/30 transition-all duration-300 shadow-lg">
              <AvatarImage 
                src={avatarUrl || undefined} 
                alt={fullName || storeName || "شريك"} 
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-white font-black">
                {getInitials(fullName || storeName || "U")}
              </AvatarFallback>
            </Avatar>
            
            {/* حلقة متحركة */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-cyan-500/30 transition-all duration-500 scale-110 opacity-0 group-hover:opacity-100" />
          </div>
          
          <div className="text-center space-y-0.5">
            <h3 className="font-black text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
              {storeName || fullName || "متجر"}
            </h3>
            {fullName && storeName && fullName !== storeName && (
              <p className="text-xs text-white/50 font-bold line-clamp-1">
                {fullName}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PartnerCard;
