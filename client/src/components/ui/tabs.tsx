import { cn } from "@/lib/utils"

const tabs = [
  { key: "inventory", label: "Inventory" },
  { key: "consumption", label: "Consumption Entry" },
  { key: "transfer", label: "Transfer" },
]

export const InventoryTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: string
  onChange: (tab: string) => void
}) => {
  return (
    <div className="ml-2 border-b-3 border-[#CBCBCB]">
      <div className="flex gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-[#94979F] hover:text-foreground"
              )}
            >
              {tab.label}

              {isActive && (
                <span className="absolute left-0 -bottom-0.75 h-0.75 w-full bg-teal-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
