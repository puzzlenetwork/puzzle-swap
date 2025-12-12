import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { useSwapVM } from "@screens/Trade/SwapVM";
import TransactionHistory from "@components/TransactionHistory";
import transactionHistoryService, { ParsedTransaction } from "@src/services/transactionHistoryService";
import SizedBox from "@components/SizedBox";

const PAGE_SIZE = 10;
const MAX_TRANSACTIONS = 30;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
  box-sizing: border-box;
`;

const SwapHistory: React.FC = () => {
  const { accountStore } = useStores();
  const vm = useSwapVM();
  const [allTransactions, setAllTransactions] = useState<ParsedTransaction[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    const address = accountStore.effectiveAddress;
    if (!address) {
      setAllTransactions([]);
      return;
    }

    setLoading(true);
    try {
      const history = await transactionHistoryService.getSwapHistory(address, MAX_TRANSACTIONS);
      setAllTransactions(history);
      setDisplayCount(PAGE_SIZE);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [accountStore.effectiveAddress]);

  useEffect(() => {
    if (vm.swapCounter > 0) {
      setTimeout(() => loadHistory(), 3000);
    }
  }, [vm.swapCounter]);

  if (!accountStore.address) {
    return null;
  }

  const visibleTransactions = allTransactions.slice(0, displayCount);
  const hasMore = displayCount < allTransactions.length && displayCount < MAX_TRANSACTIONS;

  return (
    <Root>
      <SizedBox height={24} />
      <TransactionHistory
        transactions={visibleTransactions}
        loading={loading}
        emptyText="Your swap transactions will show up here"
        title="Swap History"
        subtitle="Last 30 days"
        onLoadMore={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
        hasMore={hasMore}
      />
    </Root>
  );
};

export default observer(SwapHistory);
