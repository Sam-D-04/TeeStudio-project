type TabItem = {
  key: string;
  label: string;
  danger?: boolean;
};

type SegmentedTabsProps = {
  tabs: TabItem[];
  activeKey: string;
};

export default function SegmentedTabs({ tabs, activeKey }: SegmentedTabsProps) {
  return (
    <div className="flex w-full overflow-x-auto rounded-[10px] border border-border bg-surface-alt p-1 sm:w-auto">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const inactiveText = tab.danger
          ? "text-error hover:text-error"
          : "text-text-secondary hover:text-text-main";

        return (
          <button
            key={tab.key}
            type="button"
            className={`whitespace-nowrap rounded-[8px] px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive ? "bg-surface text-text-main shadow-sm" : inactiveText
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
