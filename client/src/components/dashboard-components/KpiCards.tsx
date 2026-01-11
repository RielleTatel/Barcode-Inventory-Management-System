import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

import {
  AlertTriangle,
  Boxes,
  Utensils,
  Truck,
} from 'lucide-react';

export interface InventoryKpiData {
  lowStock: number;
  totalItems: number;
  preparedFood: number;
  pendingTransfers: number;
}

type KpiConfig = {
  title: string;
  subtitle: string;
  description: string;
  iconColor: string;
  dataKey: keyof InventoryKpiData;
  icon?: LucideIcon;
};

type KpiCardProps = {
  title: string;
  iconColor: string;
  subtitle: string;
  description: string;
  value: number;
  icon?: LucideIcon;
};

const KpiCard = ({
  title,
  subtitle,
  description,
  iconColor,
  value,
  icon: Icon,
}: KpiCardProps) => {
  return (
    <Card className="bg-white shadow-md border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        <CardTitle className="text-sm font-bold text-[#94979F]">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className={`text-xs mt-2 ${iconColor}`}>{subtitle}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};


type KpiCardsProps = {
  data: InventoryKpiData;
};

export const KpiCards = ({ data }: KpiCardsProps) => {
const configs: KpiConfig[] = [
  {
    title: 'Low Stock Items',
    subtitle: 'Below minimum level',
    description: 'Items requiring restock',
    iconColor: 'text-[#507ADC]',
    icon: AlertTriangle,
    dataKey: 'lowStock',
  },
  {
    title: 'Total Inventory Items',
    subtitle: 'Across all branches',
    description: 'Active inventory records',
    iconColor: 'text-[#507ADC]',
    icon: Boxes,
    dataKey: 'totalItems',
  },
  {
    title: 'Prepared Food Stock',
    subtitle: 'Ready for sale',
    description: 'Finished goods available',
    iconColor: 'text-[#507ADC]',
    icon: Utensils,
    dataKey: 'preparedFood',
  },
  {
    title: 'Pending Transfers',
    subtitle: 'Awaiting approval',
    description: 'Inter-branch requests',
    iconColor: 'text-[#507ADC]',
    icon: Truck,
    dataKey: 'pendingTransfers',
  },
];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {configs.map(config => (
        <KpiCard
          key={config.dataKey}
          title={config.title}
          subtitle={config.subtitle}
          description={config.description}
          iconColor={config.iconColor}
          icon={config.icon}
          value={data[config.dataKey]}
        />
      ))}
    </div>
  );
}
