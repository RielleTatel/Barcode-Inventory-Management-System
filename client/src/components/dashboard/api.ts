import api from "@/hooks/api";
import type { BranchDashboardData, GlobalDashboardData } from ".";

export const fetchBranchDashboard = async (branchId: number | string): Promise<BranchDashboardData> => {
  const { data } = await api.get(`/branches/${branchId}/dashboard/`);
  return data;
};

export const fetchGlobalDashboard = async (): Promise<GlobalDashboardData> => {
  const { data } = await api.get('/branches/global-dashboard/');
  return data;
};
