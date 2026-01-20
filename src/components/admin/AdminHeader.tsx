import { User, LogOut, Bell, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import qrLogo from "@/assets/qr-logo.png";

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-4"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center backdrop-blur-xl bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10 shadow-2xl shadow-black/20">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={qrLogo} alt="QRM" className="h-10 sm:h-12 w-auto drop-shadow-2xl" />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-black text-white font-cyber tracking-wider">
                QRM Admin
              </h1>
              <p className="text-[10px] sm:text-xs text-white/80 font-arabic font-bold">لوحة التحكم</p>
            </div>
          </motion.div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => navigate("/")}
              >
                <Home className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </Button>
            </motion.div>

            {/* Admin Profile */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-bold">المسؤول</span>
              </Button>
            </motion.div>
            
            {/* Logout */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onLogout}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold shadow-lg shadow-red-500/20 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">خروج</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default AdminHeader;
