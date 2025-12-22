import React from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Column, Row } from "@components/Flex";
import { observer } from "mobx-react-lite";
import { IRecommendedSwap } from "../AddLiquidityInterfaceVM";
import tokenLogos from "@src/constants/tokenLogos";
import BN from "@src/utils/BN";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

interface IProps {
  swap: IRecommendedSwap;
  selected?: boolean;
  onToggle?: (swap: IRecommendedSwap) => void;
  onSourceTokenClick?: (swap: IRecommendedSwap) => void;
  onAmountChange?: (swap: IRecommendedSwap, amount: string) => void;
  sourceTokenLogo?: string;
  sourceTokenBalance?: string;
  sendUsdValue?: string;
  receiveUsdValue?: string;
  priceImpact?: BN;
  loading?: boolean;
}

const Root = styled.div<{ loading?: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  transition: opacity 0.2s;
  min-width: 0;

  ${({ loading, theme }) => loading && `
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${theme.colors.white}B3;
      border-radius: 16px;
      animation: ${pulse} 1.5s ease-in-out infinite;
    }
  `}
`;

const TokenHeader = styled(Row)`
  justify-content: space-between;
  align-items: center;
`;

const TokenInfo = styled(Row)`
  align-items: center;
  gap: 8px;
`;

const IconContainer = styled.div`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }
`;

const TokenName = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
`;

const ShareText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const Checkbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${({ checked, theme }) => (checked ? theme.colors.blue500 : theme.colors.primary100)};
  border: 1px solid ${({ checked, theme }) => (checked ? theme.colors.button : theme.colors.primary100)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
`;

const SwapRow = styled(Row)`
  gap: 8px;
  align-items: stretch;
`;

const AmountField = styled.div<{ error?: boolean }>`
  flex: 1;
  min-width: 0;
  background: ${({ error, theme }) => (error ? theme.colors.error100 : theme.colors.primary100)};
  border: 1px solid ${({ error, theme }) => (error ? theme.colors.error500 : "transparent")};
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AmountRow = styled(Row)`
  align-items: center;
  gap: 4px;
`;

const AmountInput = styled.input`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary800};
  background: transparent;
  border: none;
  outline: none;
  flex: 1;
  min-width: 0;
  padding: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary650};
  }
`;

const AmountValue = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary800};
  flex: 1;
  min-width: 0;
`;

const UsdText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary650};
  white-space: nowrap;
`;

const MaxButton = styled.button`
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.blue500};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.blue500}1A;
  }
`;

const TokenSelector = styled.div<{ clickable?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  transition: all 0.2s;
  width: 160px;
  flex-shrink: 0;

  &:hover {
    ${({ clickable, theme }) => clickable && `
      background: ${theme.colors.primary50};
      border-color: ${theme.colors.primary300};
    `}
  }
`;

const TokenSelectorIcon = styled.div`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 24px;
    height: 24px;
    object-fit: cover;
  }
`;

const TokenSelectorLabel = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

const SectionLabel = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const BalanceText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const ErrorText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.error500};
`;

const PriceImpactBadge = styled.span<{ level?: "normal" | "warning" | "danger" }>`
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ level, theme }) =>
    level === "danger" ? theme.colors.error100 :
    level === "warning" ? "#FFF3CD" :
    theme.colors.primary100};
  color: ${({ level, theme }) =>
    level === "danger" ? theme.colors.error500 :
    level === "warning" ? "#856404" :
    theme.colors.primary650};
`;

const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.primary650};
`;

const RecommendedSwapCard: React.FC<IProps> = ({
  swap,
  selected = true,
  onToggle,
  onSourceTokenClick,
  onAmountChange,
  sourceTokenLogo,
  sourceTokenBalance,
  sendUsdValue,
  receiveUsdValue,
  priceImpact,
  loading
}) => {
  const defaultLogo = tokenLogos.USDT_WXG || tokenLogos.USDT;
  const currentSourceLogo = sourceTokenLogo || defaultLogo;

  // Store amount without thousand separators to avoid parsing issues
  const cleanFormattedAmount = swap.amountToSendFormatted.replace(/,/g, "");
  const [localAmount, setLocalAmount] = React.useState(cleanFormattedAmount);

  React.useEffect(() => {
    // Remove commas when syncing from prop
    setLocalAmount(swap.amountToSendFormatted.replace(/,/g, ""));
  }, [swap.amountToSendFormatted]);

  const isExceedingBalance = React.useMemo(() => {
    if (!sourceTokenBalance || !localAmount) return false;
    const amount = parseFloat(localAmount.replace(/,/g, ""));
    const balance = parseFloat(sourceTokenBalance.replace(/,/g, ""));
    return !isNaN(amount) && !isNaN(balance) && amount > balance;
  }, [localAmount, sourceTokenBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setLocalAmount(value);
  };

  const handleAmountBlur = () => {
    if (localAmount && onAmountChange && !isExceedingBalance) {
      onAmountChange(swap, localAmount);
    }
  };

  const handleMaxClick = () => {
    if (sourceTokenBalance) {
      const cleanBalance = sourceTokenBalance.replace(/,/g, "");
      setLocalAmount(cleanBalance);
      if (onAmountChange) {
        onAmountChange(swap, cleanBalance);
      }
    }
  };

  // Price impact levels: < 3% normal, 3-5% warning, > 5% danger
  const getPriceImpactLevel = (): "normal" | "warning" | "danger" | undefined => {
    if (!priceImpact) return undefined;
    if (priceImpact.gt(5)) return "danger";
    if (priceImpact.gt(3)) return "warning";
    return "normal";
  };

  const priceImpactLevel = getPriceImpactLevel();

  return (
    <Root loading={loading}>
      <TokenHeader>
        <TokenInfo>
          <IconContainer>
            <img src={swap.tokenLogo} alt={swap.tokenSymbol} />
          </IconContainer>
          <Column>
            <TokenName>{swap.tokenSymbol}</TokenName>
            <Row alignItems="center" style={{ gap: 4 }}>
              <ShareText>Share: {swap.tokenShare}%</ShareText>
              {priceImpact && priceImpactLevel && (
                <PriceImpactBadge level={priceImpactLevel}>
                  {priceImpactLevel === "danger" ? "⚠️ " : ""}
                  Price Impact: {priceImpact.toFormat(2)}%
                </PriceImpactBadge>
              )}
            </Row>
          </Column>
        </TokenInfo>
        <Checkbox checked={selected} onClick={() => onToggle?.(swap)}>
          {selected && (
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </Checkbox>
      </TokenHeader>

      {sourceTokenBalance && (
        <Row justifyContent="flex-end" alignItems="center">
          <BalanceText>
            Balance: {sourceTokenBalance} {swap.sourceToken.symbol}
            <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
          </BalanceText>
        </Row>
      )}

      <SwapRow>
        <AmountField error={isExceedingBalance}>
          <SectionLabel>You send</SectionLabel>
          <AmountRow>
            <AmountInput
              type="text"
              value={localAmount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="0.0"
            />
            {sendUsdValue && <UsdText>{sendUsdValue}</UsdText>}
          </AmountRow>
          {isExceedingBalance && <ErrorText>Insufficient balance</ErrorText>}
        </AmountField>

        <TokenSelector clickable={!!onSourceTokenClick} onClick={() => onSourceTokenClick?.(swap)}>
          <TokenSelectorIcon>
            <img src={currentSourceLogo} alt={swap.sourceToken.symbol} />
          </TokenSelectorIcon>
          <TokenSelectorLabel>{swap.sourceToken.symbol}</TokenSelectorLabel>
          {onSourceTokenClick && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </TokenSelector>
      </SwapRow>

      <ArrowContainer>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ArrowContainer>

      <SwapRow>
        <AmountField>
          <SectionLabel>You receive</SectionLabel>
          <AmountRow>
            <AmountValue>{swap.amountToReceiveFormatted}</AmountValue>
            {receiveUsdValue && <UsdText>{receiveUsdValue}</UsdText>}
          </AmountRow>
        </AmountField>

        <TokenSelector>
          <TokenSelectorIcon>
            <img src={swap.tokenLogo} alt={swap.tokenSymbol} />
          </TokenSelectorIcon>
          <TokenSelectorLabel>{swap.tokenSymbol}</TokenSelectorLabel>
        </TokenSelector>
      </SwapRow>
    </Root>
  );
};

export default observer(RecommendedSwapCard);
