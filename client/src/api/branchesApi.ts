import api from "@/hooks/api";

export interface Branch {
  id: number;
  name: string;
  branch_type: 'kitchen' | 'cafe_only';
  address: string;
}

export interface BranchFormData {
  name: string;
  branch_type: 'kitchen' | 'cafe_only';
  address: string;
}

export const fetchAllBranches = async (): Promise<Branch[]> => {
  const { data } = await api.get('/branches/');
  return data;
};

export const fetchBranchById = async (id: number): Promise<Branch> => {
  const { data } = await api.get(`/branches/${id}/`);
  return data;
};

export const createBranch = async (branch: BranchFormData): Promise<Branch> => {
  const { data } = await api.post('/branches/', branch);
  return data.data; // Backend returns { message, data }
};

export const updateBranch = async (id: number, updates: Partial<BranchFormData>): Promise<Branch> => {
  const { data } = await api.patch(`/branches/${id}/`, updates);
  return data.data;
};

export const deleteBranch = async (id: number): Promise<void> => {
  await api.delete(`/branches/${id}/`);
};
