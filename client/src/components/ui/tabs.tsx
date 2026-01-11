import { cn } from "@/lib/utils"

const tabs = [
  { key: "inventory", label: "Inventory" },
  { key: "consumption", label: "Consumption Entry" },
  { key: "transfer", label: "Transfer" },
]

const supplyTabs = [
  { key: "receive-delivery", label: "Receive Delivery" },
  { key: "supplier-directory", label: "Supplier Directory" },
  { key: "purchase-history", label: "Purchase History" },
]

export const InventoryTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: string
  onChange: (tab: string) => void
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E5E5E5] p-1">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                "flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-[#ECEFF7] text-[#507ADC]"
                  : "text-text-color hover:bg-inner-background hover:text-[#507ADC]"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const SupplyTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: string
  onChange: (tab: string) => void
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E5E5E5] p-1">
      <div className="flex gap-1">
        {supplyTabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                "flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-[#ECEFF7] text-[#507ADC]"
                  : "text-text-color hover:bg-inner-background hover:text-[#507ADC]"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
