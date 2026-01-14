import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import GridTable from "@components/GridTable";
import { ParsedTransaction, TokenAmount } from "@src/services/transactionHistoryService";
import { EXPLORER_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Skeleton from "react-loading-skeleton";
import Loading from "@components/Loading";
import { useStores } from "@stores";

dayjs.extend(relativeTime);

interface IProps {
  transactions: ParsedTransaction[];
  loading?: boolean;
  loadingMore?: boolean;
  emptyText?: string;
  title?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  subtitle?: string;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledCard = styled(Card)`
  padding: 10px !important;
  overflow: auto;
  max-width: calc(100vw - 32px);
`;

const StyledGridTable = styled(GridTable)`
  min-width: 100%;
  .gridTitle {
    padding: 10px !important;
  }
`;

const TransactionRow = styled(Row)`
  box-sizing: border-box;
  margin-left: 0 !important;
  margin-right: 0 !important;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary50};
  }
`;

const TypeBadge = styled.span<{ txType: string; upColor: string; downColor: string }>`
  display: inline-block;
  width: 50px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ txType, upColor, downColor }) => {
    switch (txType) {
      case "swap":
        return "rgba(112, 117, 233, 0.15)";
      case "deposit":
      case "stake":
        return `${upColor}26`;
      case "withdraw":
      case "unstake":
        return `${downColor}26`;
      case "claim":
        return `${upColor}26`;
      default:
        return "rgba(128, 130, 197, 0.15)";
    }
  }};
  color: ${({ txType, upColor, downColor }) => {
    switch (txType) {
      case "swap":
        return "#7075E9";
      case "deposit":
      case "stake":
        return upColor;
      case "withdraw":
      case "unstake":
        return downColor;
      case "claim":
        return upColor;
      default:
        return "#8082C5";
    }
  }};
`;

const DetailsRow = styled(Row)`
  align-items: center;
  gap: 8px;
  overflow: hidden;
`;

const TokenPairIcons = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const TokenIcon = styled.img<{ overlap?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.white};
  margin-left: ${({ overlap }) => (overlap ? "-8px" : "0")};
`;

const SmallText = styled(Text)`
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeText = styled(Text)`
  text-align: right;
  font-size: 12px;
`;

const EmptyText = styled(Text)`
  grid-column: 1 / -1;
  text-align: center;
  padding: 16px 0;
`;

const SkeletonWrapper = styled.div`
  margin: 16px 24px;
  width: calc(100% - 48px);
`;

const LoadMoreText = styled(Text)`
  cursor: pointer;
  padding: 8px 0;
`;

const getTokenLogo = (assetId?: string): string | undefined => {
  if (!assetId || assetId === "WAVES") {
    return TOKENS_BY_ASSET_ID["WAVES"]?.logo;
  }
  return TOKENS_BY_ASSET_ID[assetId]?.logo;
};

const TransactionDetails: React.FC<{ tx: ParsedTransaction }> = ({ tx }) => {
  if (tx.type === "swap" && tx.fromSymbol && tx.toSymbol) {
    const fromLogo = getTokenLogo(tx.fromAssetId);
    const toLogo = getTokenLogo(tx.toAssetId);
    return (
      <DetailsRow>
        <TokenPairIcons>
          {fromLogo && <TokenIcon src={fromLogo} alt={tx.fromSymbol} />}
          {toLogo && <TokenIcon src={toLogo} alt={tx.toSymbol} overlap />}
        </TokenPairIcons>
        <SmallText fitContent>
          {tx.fromAmount?.toFormat(2)} {tx.fromSymbol} → {tx.toAmount?.toFormat(2)} {tx.toSymbol}
        </SmallText>
      </DetailsRow>
    );
  }
  if (["deposit", "withdraw", "claim"].includes(tx.type)) {
    const tokens = tx.tokens ?? (tx.symbol ? [{ assetId: tx.assetId!, amount: tx.amount!, symbol: tx.symbol }] : []);
    if (tokens.length === 0) return <SmallText fitContent>—</SmallText>;

    return (
      <DetailsRow>
        <TokenPairIcons>
          {tokens.map((token, index) => {
            const logo = getTokenLogo(token.assetId);
            return logo ? <TokenIcon key={token.assetId} src={logo} alt={token.symbol} overlap={index > 0} /> : null;
          })}
        </TokenPairIcons>
        <SmallText fitContent>
          {tokens.map((token) => `${token.amount?.toFormat(4)} ${token.symbol}`).join(", ")}
        </SmallText>
      </DetailsRow>
    );
  }
  if (tx.type === "stake" || tx.type === "unstake") {
    return (
      <SmallText fitContent>
        {tx.type === "stake" ? "Staked LP" : "Unstaked LP"}
      </SmallText>
    );
  }
  return <SmallText fitContent>—</SmallText>;
};

const TransactionHistory: React.FC<IProps> = ({
  transactions,
  loading,
  loadingMore,
  emptyText = "Your transactions will show up here",
  title = "Transaction History",
  onLoadMore,
  hasMore = true,
  subtitle
}) => {
  const { accountStore } = useStores();
  if (loading) {
    return (
      <Root>
        <Row justifyContent="space-between" alignItems="center">
          <Text weight={500} type="secondary">
            {title}
          </Text>
          {subtitle && (
            <Text textAlign="right" size="small" type="secondary">
              {subtitle}
            </Text>
          )}
        </Row>
        <SizedBox height={8} />
        <StyledCard>
          <SkeletonWrapper>
            <Skeleton height={40} count={3} />
          </SkeletonWrapper>
        </StyledCard>
      </Root>
    );
  }

  return (
    <Root>
      <Row justifyContent="space-between" alignItems="center">
        <Text weight={500} type="secondary">
          {title}
        </Text>
        {subtitle && (
          <Text textAlign="right" size="small" type="secondary">
            {subtitle}
          </Text>
        )}
      </Row>
      <SizedBox height={8} />
      <StyledCard>
        <StyledGridTable desktopTemplate="1fr 70px 90px" mobileTemplate="1fr 60px 70px">
          <div className="gridTitle">
            <div>Details</div>
            <div>Type</div>
            <div>Time</div>
          </div>
          {transactions.length === 0 ? (
            <TransactionRow className="gridRow" alignItems="center">
              <EmptyText type="secondary">{emptyText}</EmptyText>
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
                  <TransactionDetails tx={tx} />
                  <TypeBadge txType={tx.type} upColor={accountStore.priceColors.upAlt} downColor={accountStore.priceColors.downAlt}>{tx.type}</TypeBadge>
                  <TimeText fitContent nowrap type="secondary">
                    {(dayjs(tx.timestamp) as any).fromNow()}
                  </TimeText>
                </TransactionRow>
              ))}
              {onLoadMore && hasMore && (
                <>
                  <SizedBox height={8} />
                  <LoadMoreText type="secondary" size="small" textAlign="center" onClick={onLoadMore}>
                    {loadingMore ? <Loading big /> : "Load more"}
                  </LoadMoreText>
                </>
              )}
            </>
          )}
        </StyledGridTable>
      </StyledCard>
    </Root>
  );
};

export default observer(TransactionHistory);
