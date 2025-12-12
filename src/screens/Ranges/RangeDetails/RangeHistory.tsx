import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import TransactionHistory from "@components/TransactionHistory";
import transactionHistoryService, { ParsedTransaction } from "@src/services/transactionHistoryService";
import SizedBox from "@components/SizedBox";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";

const PAGE_SIZE = 10;
const MAX_TRANSACTIONS = 30;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;

const RangeHistory: React.FC = () => {
  const { accountStore } = useStores();
  const vm = useRangeDetailsInterfaceVM();
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
      const history = await transactionHistoryService.getPoolHistory(address, MAX_TRANSACTIONS);
      const rangeAddress = vm.range?.address;
      const filtered = rangeAddress ? history.filter((tx) => tx.poolAddress === rangeAddress) : history;
      setAllTransactions(filtered);
      setDisplayCount(PAGE_SIZE);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [accountStore.effectiveAddress, vm.range?.address]);

  if (!accountStore.address) {
    return null;
  }

  const visibleTransactions = allTransactions.slice(0, displayCount);
  const hasMore = displayCount < allTransactions.length && displayCount < MAX_TRANSACTIONS;

  return (
    <Root>
      <TransactionHistory
        transactions={visibleTransactions}
        loading={loading}
        emptyText="Your range transactions will show up here"
        title="Your Transaction History"
        onLoadMore={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
        hasMore={hasMore}
      />
      <SizedBox height={24} />
    </Root>
  );
};

export default observer(RangeHistory);
