import { Button } from "@/components/ui/button";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";
import PendingUsers from "@/components/admin-components/PendingUsers";
import ApprovedUsers from "@/components/admin-components/ApprovedUsers";

const adminTabs = [
  { key: "pending", label: "Pending Approvals" },
  { key: "approved", label: "Approved Users" },
];

const AdminPanel = () => {
  const [activeTab, handleTabChange] = useTabWithUrl("pending");

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        return <PendingUsers />;
      case "approved":
        return <ApprovedUsers />;
      default:
        return <PendingUsers />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-y-2.5">
      {/* Header */}
      <div className="rounded-xl p-2 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-[32px] font-bold">Admin Panel</p>
          <p className="text-md">Manage user registrations and permissions</p>
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline">Export Users</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full bg-white rounded-xl border border-[#E5E5E5] p-1">
        <div className="flex gap-1">
          {adminTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-[#507ADC] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AdminPanel;
