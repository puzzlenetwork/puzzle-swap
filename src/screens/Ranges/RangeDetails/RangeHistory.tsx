import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import TransactionHistory from "@components/TransactionHistory";
import transactionHistoryService, { ParsedTransaction } from "@src/services/transactionHistoryService";
import SizedBox from "@components/SizedBox";
import SwitchButtons from "@components/SwitchButtons";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";

const PAGE_SIZE = 10;
const MAX_TRANSACTIONS = 30;

type HistoryTab = 0 | 1;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;

const SwitchWrapper = styled.div`
  max-width: 360px;
  margin-bottom: 16px;
`;

const TAB_CONFIG: Record<HistoryTab, { title: string; emptyText: string }> = {
  0: {
    title: "Your Transaction History",
    emptyText: "Your range transactions will show up here"
  },
  1: {
    title: "All Transactions",
    emptyText: "No transactions for this range yet"
  }
};

const RangeHistory: React.FC = () => {
  const { accountStore } = useStores();
  const vm = useRangeDetailsInterfaceVM();
  const [activeTab, setActiveTab] = useState<HistoryTab>(0);
  const [allTransactions, setAllTransactions] = useState<ParsedTransaction[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const userAddress = accountStore.effectiveAddress;
  const rangeAddress = vm.range?.address;
  const isConnected = !!accountStore.address;
  const effectiveTab: HistoryTab = isConnected ? activeTab : 1;

  const loadHistory = async () => {
    if (!rangeAddress) {
      setAllTransactions([]);
      return;
    }

    if (effectiveTab === 0 && !userAddress) {
      setAllTransactions([]);
      return;
    }

    setLoading(true);
    try {
      let history: ParsedTransaction[];
      if (effectiveTab === 0) {
        const userHistory = await transactionHistoryService.getPoolHistory(userAddress!, MAX_TRANSACTIONS);
        history = userHistory.filter((tx) => tx.poolAddress === rangeAddress);
      } else {
        history = await transactionHistoryService.getRangeAllHistory(rangeAddress, MAX_TRANSACTIONS);
      }
      setAllTransactions(history);
      setDisplayCount(PAGE_SIZE);
    } catch {
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userAddress, rangeAddress, effectiveTab]);

  const visibleTransactions = allTransactions.slice(0, displayCount);
  const hasMore = displayCount < allTransactions.length && displayCount < MAX_TRANSACTIONS;
  const { title, emptyText } = TAB_CONFIG[effectiveTab];

  return (
    <Root>
      {isConnected && (
        <SwitchWrapper>
          <SwitchButtons
            values={["Your History", "All Transactions"]}
            active={activeTab}
            onActivate={(v) => setActiveTab(v)}
          />
        </SwitchWrapper>
      )}
      <TransactionHistory
        transactions={visibleTransactions}
        loading={loading}
        emptyText={emptyText}
        title={title}
        onLoadMore={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
        hasMore={hasMore}
      />
      <SizedBox height={24} />
    </Root>
  );
};

export default observer(RangeHistory);
