import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import TransactionHistory from "@components/TransactionHistory";
import transactionHistoryService, { ParsedTransaction } from "@src/services/transactionHistoryService";
import SizedBox from "@components/SizedBox";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
  box-sizing: border-box;
`;

const SwapHistory: React.FC = () => {
  const { accountStore } = useStores();
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
      const history = await transactionHistoryService.getSwapHistory(address, limit);
      setTransactions(history);
    } catch {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [accountStore.effectiveAddress]);

  if (!accountStore.address) {
    return null;
  }

  return (
    <Root>
      <SizedBox height={24} />
      <TransactionHistory
        transactions={transactions}
        loading={loading}
        loadingMore={loadingMore}
        emptyText="Your swap transactions will show up here"
        title="Swap History"
        onLoadMore={() => loadHistory(true)}
      />
    </Root>
  );
};

export default observer(SwapHistory);
