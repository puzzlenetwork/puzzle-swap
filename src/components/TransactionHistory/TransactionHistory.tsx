import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import GridTable from "@components/GridTable";
import { ParsedTransaction, TransactionType } from "@src/services/transactionHistoryService";
import { EXPLORER_URL } from "@src/constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Skeleton from "react-loading-skeleton";
import Loading from "@components/Loading";

dayjs.extend(relativeTime);

interface IProps {
  transactions: ParsedTransaction[];
  loading?: boolean;
  loadingMore?: boolean;
  emptyText?: string;
  onLoadMore?: () => void;
  title?: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TransactionRow = styled(Row)`
  box-sizing: border-box;
  padding: 16px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary50};
  }

  @media (min-width: 880px) {
    padding: 16px 24px !important;
  }
`;

const TypeBadge = styled.span<{ txType: string }>`
  display: inline-block;
  width: 50px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ txType }) => {
    switch (txType) {
      case "swap":
        return "rgba(112, 117, 233, 0.15)";
      case "deposit":
      case "stake":
        return "rgba(53, 161, 90, 0.15)";
      case "withdraw":
      case "unstake":
        return "rgba(237, 130, 126, 0.15)";
      case "claim":
        return "rgba(31, 137, 67, 0.15)";
      default:
        return "rgba(128, 130, 197, 0.15)";
    }
  }};
  color: ${({ txType }) => {
    switch (txType) {
      case "swap":
        return "#7075E9";
      case "deposit":
      case "stake":
        return "#35A15A";
      case "withdraw":
      case "unstake":
        return "#ED827E";
      case "claim":
        return "#1F8943";
      default:
        return "#8082C5";
    }
  }};
`;

const formatTransactionDetails = (tx: ParsedTransaction): string => {
  if (tx.type === "swap" && tx.fromSymbol && tx.toSymbol) {
    return `${tx.fromAmount?.toFormat(4)} ${tx.fromSymbol} → ${tx.toAmount?.toFormat(4)} ${tx.toSymbol}`;
  }
  if (["deposit", "withdraw", "claim"].includes(tx.type) && tx.symbol) {
    return `${tx.amount?.toFormat(4)} ${tx.symbol}`;
  }
  if (tx.type === "stake" || tx.type === "unstake") {
    return tx.type === "stake" ? "Staked LP tokens" : "Unstaked LP tokens";
  }
  return "—";
};

const TransactionHistory: React.FC<IProps> = ({
  transactions,
  loading,
  loadingMore,
  emptyText = "Your transactions will show up here",
  onLoadMore,
  title = "Transaction History"
}) => {
  if (loading) {
    return (
      <Root>
        <Text weight={500} type="secondary">
          {title}
        </Text>
        <SizedBox height={8} />
        <Card style={{ padding: 0 }}>
          <Skeleton height={45} count={3} style={{ margin: "16px 24px", width: "calc(100% - 48px)" }} />
        </Card>
      </Root>
    );
  }

  return (
    <Root>
      <Row justifyContent="space-between" alignItems="center">
        <Text weight={500} type="secondary">
          {title}
        </Text>
        <Text size="small" type="secondary">
          Last 30 transactions
        </Text>
      </Row>
      <SizedBox height={8} />
      <Card style={{ padding: 0, overflow: "auto", maxWidth: "calc(100vw - 32px)" }}>
        <GridTable
          style={{ width: "fit-content", minWidth: "100%" }}
          desktopTemplate={"2fr 1fr 1fr"}
          mobileTemplate={"2fr 1fr 1fr"}
        >
          <div className="gridTitle">
            <div>Details</div>
            <div>Type</div>
            <div>Time</div>
          </div>
          {transactions.length === 0 ? (
            <TransactionRow className="gridRow" alignItems="center">
              <Text type="secondary" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "16px 0" }}>
                {emptyText}
              </Text>
            </TransactionRow>
          ) : (
            <>
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  className="gridRow"
                  alignItems="center"
                  onClick={() => window.open(`${EXPLORER_URL}/transactions/${tx.id}`)}
                >
                  <Text fitContent nowrap style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {formatTransactionDetails(tx)}
                  </Text>
                  <TypeBadge txType={tx.type}>{tx.type}</TypeBadge>
                  <Text fitContent nowrap type="secondary">
                    {(dayjs(tx.timestamp) as any).fromNow()}
                  </Text>
                </TransactionRow>
              ))}
              {onLoadMore && (
                <>
                  <SizedBox height={8} />
                  <Text
                    type="secondary"
                    weight={500}
                    textAlign="center"
                    style={{ cursor: "pointer", padding: "8px 0" }}
                    onClick={onLoadMore}
                  >
                    {loadingMore ? <Loading big /> : "Load more"}
                  </Text>
                  <SizedBox height={8} />
                </>
              )}
            </>
          )}
        </GridTable>
      </Card>
    </Root>
  );
};

export default observer(TransactionHistory);
