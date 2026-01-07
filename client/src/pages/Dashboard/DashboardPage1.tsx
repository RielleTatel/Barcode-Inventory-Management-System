import { KpiCards } from '@/components/dashboard-components/KpiCards';
import type { InventoryKpiData } from '@/components/dashboard-components/KpiCards';



const DashboardPage1 = () => {
  const branchData: InventoryKpiData = {
    lowStock: 2,
    totalItems: 58,
    preparedFood: 12,
    pendingTransfers: 1,
  };

  return <KpiCards data={branchData} />;
}

export default DashboardPage1;
