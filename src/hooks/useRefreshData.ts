
import { useState, useCallback } from "react";

export const useRefreshData = () => {
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());

  const refreshData = useCallback(() => {
    console.log("Forcing data refresh with new timestamp");
    setForceRefresh(Date.now());
  }, []);

  return { forceRefresh, refreshData };
};
