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
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </CardContent>
              </Card>
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
        <div className="text-center mb-8 sm:mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[hsl(var(--cyber-blue))] via-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-pink))] bg-clip-text text-transparent drop-shadow-2xl font-cyber">
            شركاء QRM
          </h2>
          <p className="text-white/95 text-base sm:text-lg max-w-2xl mx-auto font-bold drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)] font-arabic">
            تعرف على شركائنا المميزين وقم بزيارة متاجرهم الإلكترونية
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
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
