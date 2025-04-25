
import { useState, useEffect } from "react";

export const useRefreshData = () => {
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());

  useEffect(() => {
    const handleUrlParamChange = () => {
      setForceRefresh(Date.now());
    };

    window.addEventListener('popstate', handleUrlParamChange);
    
    const autoRefreshInterval = setInterval(() => {
      setForceRefresh(Date.now());
    }, 60000);
    
    return () => {
      window.removeEventListener('popstate', handleUrlParamChange);
      clearInterval(autoRefreshInterval);
    };
  }, []);

  const refreshData = () => {
    setForceRefresh(Date.now());
  };

  return { forceRefresh, refreshData };
};
