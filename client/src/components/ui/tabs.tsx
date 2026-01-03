import { cn } from "@/lib/utils"

const tabs = [
  { key: "inventory", label: "Inventory" },
  { key: "consumption", label: "Consumption Entry" },
  { key: "transfer", label: "Transfer" },
]

export function InventoryTabs({
  activeTab,
  onChange,
}: {
  activeTab: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="border-b">
      <div className="flex gap-8 px-1">
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
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}

              {isActive && (
                <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-teal-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
