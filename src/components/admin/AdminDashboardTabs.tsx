import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  Database, 
  Key, 
  Bell, 
  LineChart, 
  Image,
  Megaphone,
  Coins,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import UserNotificationTab from "@/components/admin/users/UserNotificationTab";
import UserAnalyticsTab from "@/components/admin/analytics/UserAnalyticsTab";
import StorageManagementTab from "@/components/admin/storage/StorageManagementTab";
import SharedImagesTab from "@/components/admin/images/SharedImagesTab";
import AdsManagementTab from "@/components/admin/ads/AdsManagementTab";
import AiCreditsTab from "@/components/admin/ai-credits/AiCreditsTab";
import FloatingAIChat from "@/components/dashboard/FloatingAIChat";
import { APIKeysManager } from "@/components/dashboard/APIKeysManager";

const tabs = [
  { id: 'stats', label: 'الإحصائيات', icon: BarChart3, color: 'from-cyan-400 to-blue-500' },
  { id: 'users', label: 'المستخدمين', icon: Users, color: 'from-purple-400 to-pink-500' },
  { id: 'storage', label: 'التخزين', icon: Database, color: 'from-green-400 to-emerald-500' },
  { id: 'api', label: 'مفاتيح API', icon: Key, color: 'from-yellow-400 to-orange-500' },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, color: 'from-pink-400 to-rose-500' },
  { id: 'analytics', label: 'التحليلات', icon: LineChart, color: 'from-indigo-400 to-blue-500' },
  { id: 'images', label: 'مستودع الصور', icon: Image, color: 'from-teal-400 to-cyan-500' },
  { id: 'ads', label: 'الإعلانات', icon: Megaphone, color: 'from-amber-400 to-orange-500' },
  { id: 'aicredits', label: 'رصيد الذكاء الاصطناعي', icon: Coins, color: 'from-lime-400 to-green-500' },
];


const AdminDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStatsTab />;
      case 'users':
        return <AdminUsersTab />;
      case 'storage':
        return <StorageManagementTab />;
      case 'api':
        return <APIKeysManager />;
      case 'notifications':
        return <UserNotificationTab />;
      case 'analytics':
        return <UserAnalyticsTab />;
      case 'images':
        return <SharedImagesTab />;
      case 'ads':
        return <AdsManagementTab />;
      default:
        return <AdminStatsTab />;
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex gap-4 min-h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-shrink-0"
          >
            <div className="sticky top-28 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 overflow-hidden">
              {/* Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg' 
                          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                        }
                      `}
                    >
                      <div className={`
                        w-9 h-9 rounded-lg flex items-center justify-center
                        ${isActive ? 'bg-white/20' : 'bg-gradient-to-br ' + tab.color}
                      `}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-sm">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-8 h-16 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
      >
        {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </motion.button>

      {/* Main Content */}
      <motion.main 
        layout
        className="flex-1 min-w-0"
      >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-4">
              {currentTab && (
                <>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentTab.color} flex items-center justify-center shadow-lg`}>
                    <currentTab.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">{currentTab.label}</h1>
                    <p className="text-white/60 text-sm font-bold">إدارة ومراقبة {currentTab.label}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </motion.main>
      
      <FloatingAIChat />
    </div>
  );
};

export default AdminDashboardTabs;
