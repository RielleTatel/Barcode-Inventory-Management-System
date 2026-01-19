import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useTabWithUrl = (defaultTab: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);

  useEffect(() => {
    const tab = searchParams.get("tab") || defaultTab;
    setActiveTab(tab);
  }, [searchParams, defaultTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return [activeTab, handleTabChange] as const;
};
