
import { useState, useCallback } from "react";

export const useRefreshData = () => {
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());

  const refreshData = useCallback(() => {
    setForceRefresh(Date.now());
  }, []);

  return { forceRefresh, refreshData };
};
