import React, { useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { AppData, Bill, MoreSubPage, NavigationTab, PayPeriodInfo } from "../types";
import { formatMoney } from "../utils/money";
import { AdBanner } from "./AdBanner";
import { StudioPreviewBanner } from "./home/StudioPreviewBanner";
import { RadialCockpitGauge } from "./home/RadialCockpitGauge";
import { QuickLaunchRibbon } from "./home/QuickLaunchRibbon";
import { TelemetryStreamDeck } from "./home/TelemetryStreamDeck";
import { WalkAwayFormulaModal } from "./home/WalkAwayFormulaModal";

interface HomeTabProps {
  data: AppData;
  availableCash: number;
  billsThisPeriodTotal: number;
  spentThisPeriodTotal: number;
  spentThisPeriodCount: number;
  missedBills: Bill[];
  goalAllocations: number;
  freeToSpend: number;
  payPeriod: PayPeriodInfo;
  onOpenPayPeriodModal: () => void;
  onNavigateToTab: (tab: NavigationTab, subPage?: MoreSubPage) => void;
  onOpenAddTransaction?: () => void;
  onOpenReceiptScanner?: () => void;
  onOpenAddBill?: () => void;
  isPaywallActive?: boolean;
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  data,
  availableCash,
  billsThisPeriodTotal,
  spentThisPeriodTotal,
  spentThisPeriodCount,
  missedBills,
  goalAllocations,
  freeToSpend,
  payPeriod,
  onOpenPayPeriodModal,
  onNavigateToTab,
  onOpenAddTransaction,
  onOpenReceiptScanner,
  onOpenAddBill,
  isPro = false,
  onUpgradeClick,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const missedBillsTotal = missedBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const daysRemainingSafe = Math.max(1, payPeriod.daysLeft || 1);
  const dailySafePace = freeToSpend > 0 ? freeToSpend / daysRemainingSafe : 0;
  const activeAccountsCount = data.accounts.filter((a) => !a.archived).length;

  return (
    <div className="flex-1 flex flex-col justify-between gap-3.5 animate-tab-enter">
      <StudioPreviewBanner />

      {missedBills.length > 0 && (
        <button
          type="button"
          onClick={() => onNavigateToTab("calendar")}
          className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-full bg-gradient-to-r from-rose-950/90 via-rose-900/80 to-rose-950/90 border border-rose-500/60 hover:border-rose-400 text-left shadow-[0_0_25px_rgba(244,63,94,0.25)] transition cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-500 text-white shadow-md shrink-0">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <b className="block truncate text-xs font-black uppercase tracking-wider text-rose-200">
                {missedBills.length} Past-Due {missedBills.length === 1 ? "Bill" : "Bills"} ({formatMoney(missedBillsTotal)})
              </b>
              <span className="block truncate text-[0.7rem] font-medium text-rose-300/90">
                Tap to review or check off in Calendar
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300 shrink-0" />
        </button>
      )}

      <RadialCockpitGauge
        availableCash={availableCash}
        billsThisPeriodTotal={billsThisPeriodTotal}
        goalAllocations={goalAllocations}
        freeToSpend={freeToSpend}
        dailySafePace={dailySafePace}
        payPeriod={payPeriod}
        onOpenPayPeriodModal={onOpenPayPeriodModal}
        onOpenBreakdown={() => setShowBreakdown(true)}
        onNavigateToTab={onNavigateToTab}
      />

      <QuickLaunchRibbon
        onNavigateToTab={onNavigateToTab}
        onOpenAddTransaction={onOpenAddTransaction}
        onOpenReceiptScanner={onOpenReceiptScanner}
        onOpenAddBill={onOpenAddBill}
      />

      <TelemetryStreamDeck
        activeAccountsCount={activeAccountsCount}
        availableCash={availableCash}
        billsThisPeriodTotal={billsThisPeriodTotal}
        spentThisPeriodTotal={spentThisPeriodTotal}
        spentThisPeriodCount={spentThisPeriodCount}
        onNavigateToTab={onNavigateToTab}
      />

      <WalkAwayFormulaModal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        payPeriod={payPeriod}
        availableCash={availableCash}
        billsThisPeriodTotal={billsThisPeriodTotal}
        goalAllocations={goalAllocations}
        freeToSpend={freeToSpend}
        dailySafePace={dailySafePace}
        daysRemainingSafe={daysRemainingSafe}
      />

      {!isPro && onUpgradeClick && (
        <AdBanner onUpgradeClick={onUpgradeClick} isPro={isPro} />
      )}
    </div>
  );
};
