import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_category: string;
  details: Json;
  created_at: string;
}

interface UseUserActivityLogsOptions {
  userId?: string;
  limit?: number;
  actionCategory?: string;
}

export const useUserActivityLogs = (options: UseUserActivityLogsOptions = {}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options.limit || 100);

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.actionCategory) {
        query = query.eq('action_category', options.actionCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [options.userId, options.actionCategory]);

  return { logs, isLoading, refetch: fetchLogs };
};
