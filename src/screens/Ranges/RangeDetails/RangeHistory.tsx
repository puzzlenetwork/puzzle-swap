import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import TransactionHistory from "@components/TransactionHistory";
import transactionHistoryService, { ParsedTransaction } from "@src/services/transactionHistoryService";
import SizedBox from "@components/SizedBox";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;
`;

const RangeHistory: React.FC = () => {
  const { accountStore } = useStores();
  const vm = useRangeDetailsInterfaceVM();
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadHistory = async (append = false) => {
    const address = accountStore.effectiveAddress;
    if (!address) {
      setTransactions([]);
      return;
    }

    append ? setLoadingMore(true) : setLoading(true);
    try {
      const limit = append ? transactions.length + 30 : 30;
      const history = await transactionHistoryService.getPoolHistory(address, limit);
      const rangeAddress = vm.range?.address;
      const filtered = rangeAddress ? history.filter((tx) => tx.poolAddress === rangeAddress) : history;
      setTransactions(filtered);
    } catch {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [accountStore.effectiveAddress, vm.range?.address]);

  if (!accountStore.address) {
    return null;
  }

  return (
    <Root>
      <TransactionHistory
        transactions={transactions}
        loading={loading}
        loadingMore={loadingMore}
        emptyText="Your range transactions will show up here"
        title="Your Transaction History"
        onLoadMore={() => loadHistory(true)}
      />
      <SizedBox height={24} />
    </Root>
  );
};

export default observer(RangeHistory);
