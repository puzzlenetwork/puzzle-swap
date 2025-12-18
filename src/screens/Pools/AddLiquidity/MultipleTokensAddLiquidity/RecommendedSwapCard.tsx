import React from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Column, Row } from "@components/Flex";
import { observer } from "mobx-react-lite";
import { IRecommendedSwap } from "../AddLiquidityInterfaceVM";
import tokenLogos from "@src/constants/tokenLogos";

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
  loading?: boolean;
}

const Root = styled.div<{ loading?: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: opacity 0.2s;

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
  width: 40px;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 40px;
    height: 40px;
    object-fit: cover;
  }
`;

const TokenName = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
`;

const ShareText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
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
`;

const SwapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const InputRow = styled(Row)`
  gap: 8px;
  align-items: center;
`;

const AmountField = styled.div<{ error?: boolean }>`
  flex: 1;
  background: ${({ error, theme }) => (error ? theme.colors.error100 : theme.colors.primary100)};
  border: 1px solid ${({ error, theme }) => (error ? theme.colors.error500 : "transparent")};
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AmountValue = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const AmountInput = styled.input`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary800};
  background: transparent;
  border: none;
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary650};
  }
`;

const MaxButton = styled.button`
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.blue500};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.blue500}1A;
  }
`;

const BalanceRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
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
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error500};
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
`;

const RecommendedSwapCard: React.FC<IProps> = ({ swap, selected = true, onToggle, onSourceTokenClick, onAmountChange, sourceTokenLogo, sourceTokenBalance, loading }) => {
  const defaultLogo = tokenLogos.USDT_WXG || tokenLogos.USDT;
  const currentSourceLogo = sourceTokenLogo || defaultLogo;
  const [localAmount, setLocalAmount] = React.useState(swap.amountToSendFormatted);

  React.useEffect(() => {
    setLocalAmount(swap.amountToSendFormatted);
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
      setLocalAmount(sourceTokenBalance);
      if (onAmountChange) {
        onAmountChange(swap, sourceTokenBalance);
      }
    }
  };

  return (
    <Root loading={loading}>
      <TokenHeader>
        <TokenInfo>
          <IconContainer>
            <img src={swap.tokenLogo} alt={swap.tokenSymbol} />
          </IconContainer>
          <Column>
            <TokenName>{swap.tokenSymbol}</TokenName>
            <ShareText>Share: {swap.tokenShare} %</ShareText>
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

      <SwapSection>
        <BalanceRow>
          <SectionLabel>You send</SectionLabel>
          {sourceTokenBalance && (
            <BalanceText>
              Balance: {sourceTokenBalance} {swap.sourceToken.symbol}
              <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
            </BalanceText>
          )}
        </BalanceRow>
        <InputRow>
          <AmountField error={isExceedingBalance}>
            <AmountInput
              type="text"
              value={localAmount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="0.0"
            />
          </AmountField>
          <TokenSelector clickable={!!onSourceTokenClick} onClick={() => onSourceTokenClick?.(swap)}>
            <TokenSelectorIcon>
              <img src={currentSourceLogo} alt={swap.sourceToken.symbol} />
            </TokenSelectorIcon>
            <TokenSelectorLabel>{swap.sourceToken.symbol}</TokenSelectorLabel>
            {onSourceTokenClick && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </TokenSelector>
        </InputRow>
        {isExceedingBalance && (
          <ErrorText>Insufficient balance</ErrorText>
        )}
      </SwapSection>

      <SwapSection>
        <SectionLabel>You receive</SectionLabel>
        <InputRow>
          <AmountField>
            <AmountValue>{swap.amountToReceiveFormatted}</AmountValue>
          </AmountField>
          <TokenSelector>
            <TokenSelectorIcon>
              <img src={swap.tokenLogo} alt={swap.tokenSymbol} />
            </TokenSelectorIcon>
            <TokenSelectorLabel>{swap.tokenSymbol}</TokenSelectorLabel>
          </TokenSelector>
        </InputRow>
      </SwapSection>
    </Root>
  );
};

export default observer(RecommendedSwapCard);
