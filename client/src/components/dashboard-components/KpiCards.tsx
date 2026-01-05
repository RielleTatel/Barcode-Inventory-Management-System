import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KpiConfig {
  key: string;
  title: string;
  icon?: React.ElementType;
  iconColor: string;
  subtitle: string;
  description: string;
  dataKey: keyof InventoryKpiData;
}

interface InventoryKpiData {
  lowStock: number;
  totalItems: number;
  preparedFood: number;
  pendingTransfers: number;
}

interface KpiCardProps {
  title: string;
  icon?: React.ElementType;
  iconColor: string;
  subtitle: string;
  description: string;
  value: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  icon: Icon,
  iconColor,
  subtitle,
  description,
  value,
}) => (
  <Card className="bg-white shadow-md border-2" style={{ borderColor: '#0033A0' }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className={`text-xs mt-2 ${iconColor}`}>{subtitle}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </CardContent>
  </Card>
);


const KpiCards: React.FC = () => {

  const data: InventoryKpiData = {
    lowStock: 6,
    totalItems: 124,
    preparedFood: 38,
    pendingTransfers: 4,
  };

  const configs: KpiConfig[] = [
    {
      key: 'lowStock',
      title: 'Low Stock Items',
      subtitle: 'Below minimum level',
      description: 'Items requiring restock',
      iconColor: 'text-red-600',
      dataKey: 'lowStock',
    },
    {
      key: 'totalItems',
      title: 'Total Inventory Items',
      subtitle: 'Across all branches',
      description: 'Active inventory records',
      iconColor: 'text-blue-600',
      dataKey: 'totalItems',
    },
    {
      key: 'preparedFood',
      title: 'Prepared Food Stock',
      subtitle: 'Ready for sale',
      description: 'Finished goods available',
      iconColor: 'text-green-600',
      dataKey: 'preparedFood',
    },
    {
      key: 'pendingTransfers',
      title: 'Pending Transfers',
      subtitle: 'Awaiting approval',
      description: 'Inter-branch requests',
      iconColor: 'text-amber-600',
      dataKey: 'pendingTransfers',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {configs.map(config => (
        <KpiCard
          key={config.key}
          title={config.title}
          icon={config.icon}
          iconColor={config.iconColor}
          subtitle={config.subtitle}
          description={config.description}
          value={data[config.dataKey]}
        />
      ))}
    </div>
  );
};

export default KpiCards;
