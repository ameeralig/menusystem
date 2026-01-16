import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PartnerCard from "./PartnerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Partner {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  store_name: string | null;
  slug: string | null;
}

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        
        // جلب بيانات المستخدمين الذين لديهم متاجر فقط
        const { data: storeSettings, error: storeError } = await supabase
          .from('store_settings')
          .select('user_id, store_name, slug')
          .not('slug', 'is', null);

        if (storeError) throw storeError;

        if (storeSettings && storeSettings.length > 0) {
          const userIds = storeSettings.map(s => s.user_id);
          
          // جلب بيانات الـ profiles المقابلة
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          if (profilesError) throw profilesError;

          // دمج البيانات
          const partnersData: Partner[] = storeSettings.map(store => {
            const profile = profiles?.find(p => p.id === store.user_id);
            return {
              id: store.user_id,
              full_name: profile?.full_name || null,
              avatar_url: profile?.avatar_url || null,
              store_name: store.store_name,
              slug: store.slug
            };
          });

          setPartners(partnersData);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-8 w-40 mx-auto mb-3 bg-white/10" />
            <Skeleton className="h-5 w-64 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 sm:p-5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10" />
                  <Skeleton className="h-4 w-20 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
            <span className="text-white">شركاء </span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">QRM</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto font-bold">
            تعرف على شركائنا المميزين
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <PartnerCard
                userId={partner.id}
                fullName={partner.full_name || ""}
                avatarUrl={partner.avatar_url}
                storeName={partner.store_name}
                slug={partner.slug}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
