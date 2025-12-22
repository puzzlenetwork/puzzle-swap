import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import Notification from "@components/Notification";
import Loading from "@components/Loading";
import Text from "@components/Text";
import Dialog from "@components/Dialog";
import TokenSelectModal from "@components/TokensSelectModal";
import { useAddLiquidityInterfaceVM, IRecommendedSwap } from "../AddLiquidityInterfaceVM";
import RecommendedSwapCard from "./RecommendedSwapCard";
import { useStores } from "@stores";
import BN from "@src/utils/BN";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px;
  gap: 12px;
`;

const RecommendedSwapsContainer = styled.div`
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const SwapsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalContent = styled(Column)`
  align-items: center;
  padding: 24px;
  gap: 16px;
`;

const ProgressText = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const ModalTokenName = styled.span`
  font-family: Roboto, sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary800};
`;

const SwapProgressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SwapProgressItem = styled(Row)<{ active?: boolean; done?: boolean; failed?: boolean }>`
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ active, done, failed, theme }) =>
    failed ? theme.colors.error100 :
    active ? theme.colors.primary100 :
    done ? theme.colors.success100 :
    theme.colors.primary50};
  border-radius: 10px;
  border: 1px solid ${({ active, failed, theme }) =>
    failed ? theme.colors.error500 :
    active ? theme.colors.blue500 :
    "transparent"};
  opacity: ${({ done, failed }) => (done || failed ? 0.7 : 1)};
  min-height: 56px;
  width: auto;
`;

const SwapProgressIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }
`;

const SwapProgressStatus = styled.span<{ done?: boolean; failed?: boolean }>`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: ${({ done, failed, theme }) =>
    failed ? theme.colors.error500 :
    done ? theme.colors.success500 :
    theme.colors.primary650};
  margin-left: auto;
  min-width: 50px;
  text-align: right;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${({ theme }) => theme.colors.blue500};
  border-radius: 2px;
`;

const RecommendedSwaps: React.FC = () => {
  const vm = useAddLiquidityInterfaceVM();
  const { accountStore, poolsStore } = useStores();
  const providedPercent = vm.providedPercentOfPool.toNumber();
  const [selectedSwaps, setSelectedSwaps] = React.useState<Set<string>>(new Set());
  const [tokenModalSwap, setTokenModalSwap] = React.useState<IRecommendedSwap | null>(null);
  const [swapsInProgress, setSwapsInProgress] = React.useState<IRecommendedSwap[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (vm.hasInsufficientTokens) {
        vm.calculateRecommendedSwaps();
      } else {
        if (vm.recommendedSwaps.length > 0) {
          vm.calculateRecommendedSwaps();
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [providedPercent, vm.hasInsufficientTokens]);

  useEffect(() => {
    if (vm.recommendedSwaps.length > 0) {
      setSelectedSwaps(new Set(vm.recommendedSwaps.map(s => s.tokenAssetId)));
    }
  }, [vm.recommendedSwaps.length]);

  const handleToggleSwap = (swap: { tokenAssetId: string }) => {
    setSelectedSwaps(prev => {
      const next = new Set(prev);
      if (next.has(swap.tokenAssetId)) {
        next.delete(swap.tokenAssetId);
      } else {
        next.add(swap.tokenAssetId);
      }
      return next;
    });
  };

  const handleSwapAll = () => {
    const swapsToExecute = vm.recommendedSwaps.filter(s => selectedSwaps.has(s.tokenAssetId));
    setSwapsInProgress(swapsToExecute);
    vm.executeSelectedSwaps(swapsToExecute);
  };

  const handleSourceTokenClick = (swap: IRecommendedSwap) => {
    setTokenModalSwap(swap);
  };

  const handleSourceTokenSelect = (assetId: string) => {
    if (tokenModalSwap) {
      vm.updateSwapSourceToken(tokenModalSwap.tokenAssetId, assetId);
    }
    setTokenModalSwap(null);
  };

  const handleAmountChange = (swap: IRecommendedSwap, amount: string) => {
    vm.updateSwapAmount(swap.tokenAssetId, amount);
  };

  const getBalancesForModal = () => {
    if (!tokenModalSwap) return [];
    return accountStore.balances.filter(b =>
      b.assetId !== tokenModalSwap.tokenAssetId && b.balance?.gt(0)
    );
  };

  const getSourceTokenBalance = (swap: IRecommendedSwap): string | undefined => {
    const balanceEntity = accountStore.findBalanceByAssetId(swap.sourceToken.assetId);
    if (!balanceEntity || balanceEntity.balance == null) return undefined;
    const decimals = balanceEntity.decimals ?? swap.sourceToken.decimals ?? 8;
    const formatted = BN.formatUnits(balanceEntity.balance, decimals);
    return formatted.gt(0.01) ? formatted.toFormat(2) : formatted.toFormat(6);
  };

  const getSendUsdValue = (swap: IRecommendedSwap): string => {
    const rate = poolsStore.usdtRate(swap.sourceToken.assetId, 1) ?? BN.ZERO;
    const amount = BN.formatUnits(swap.amountToSend, swap.sourceToken.decimals);
    const usd = amount.times(rate);
    return usd.gt(0) ? `~$${usd.toFormat(2)}` : "";
  };

  const getReceiveUsdValue = (swap: IRecommendedSwap): string => {
    const poolToken = vm.pool?.tokens.find(t => t.assetId === swap.tokenAssetId);
    if (!poolToken) return "";
    const rate = poolsStore.usdtRate(swap.tokenAssetId, 1) ?? BN.ZERO;
    const amount = BN.formatUnits(swap.amountToReceive, poolToken.decimals);
    const usd = amount.times(rate);
    return usd.gt(0) ? `~$${usd.toFormat(2)}` : "";
  };

  const getPriceImpact = (swap: IRecommendedSwap): BN | undefined => {
    if (!swap.aggregatorResponse) return undefined;

    // Calculate price impact: (expected - actual) / expected * 100
    const poolToken = vm.pool?.tokens.find(t => t.assetId === swap.tokenAssetId);
    if (!poolToken) return undefined;

    const sendRate = poolsStore.usdtRate(swap.sourceToken.assetId, 1) ?? BN.ZERO;
    const receiveRate = poolsStore.usdtRate(swap.tokenAssetId, 1) ?? BN.ZERO;

    if (sendRate.eq(0) || receiveRate.eq(0)) return undefined;

    const sendUsd = BN.formatUnits(swap.amountToSend, swap.sourceToken.decimals).times(sendRate);
    const receiveUsd = BN.formatUnits(swap.amountToReceive, poolToken.decimals).times(receiveRate);

    if (sendUsd.eq(0)) return undefined;

    const impact = sendUsd.minus(receiveUsd).div(sendUsd).times(100);
    return impact.gt(0) ? impact : BN.ZERO;
  };

  // Calculate total USD for selected swaps
  const getSelectedSwapsTotalUsd = (): string => {
    const selectedSwapsList = vm.recommendedSwaps.filter(s => selectedSwaps.has(s.tokenAssetId));
    const total = selectedSwapsList.reduce((acc, swap) => {
      const poolToken = vm.pool?.tokens.find(t => t.assetId === swap.tokenAssetId);
      if (!poolToken) return acc;
      const rate = poolsStore.usdtRate(swap.tokenAssetId, 1) ?? BN.ZERO;
      const amount = BN.formatUnits(swap.amountToReceive, poolToken.decimals);
      return acc.plus(amount.times(rate));
    }, BN.ZERO);

    return total.gt(0) ? `$${total.toFormat(2)}` : "";
  };

  const selectedCount = vm.recommendedSwaps.filter(s => selectedSwaps.has(s.tokenAssetId)).length;
  const totalUsd = getSelectedSwapsTotalUsd();

  if (!vm.hasInsufficientTokens) {
    return null;
  }

  const hasRecommendedSwaps = vm.recommendedSwaps.length > 0 || vm.swapsLoading;

  return (
    <Root>
      <Notification
        type="warning"
        text={
          <Text size="medium">
            You must have all assets to bring liquidity to the pool.
            {hasRecommendedSwaps && " Use \"Recommended Swaps\" widget to balance them."}
          </Text>
        }
      />

      {hasRecommendedSwaps && (
        <RecommendedSwapsContainer>
          <HeaderText>
            Recommended Swaps
            {vm.swapsLoading && vm.recommendedSwaps.length > 0 && (
              <span style={{ marginLeft: 8 }}><Loading /></span>
            )}
          </HeaderText>

          {vm.swapsLoading && vm.recommendedSwaps.length === 0 ? (
            <Row justifyContent="center" alignItems="center" style={{ padding: "16px" }}>
              <Loading />
              <SizedBox width={8} />
              <Text type="secondary">Calculating swaps...</Text>
            </Row>
          ) : (
            <>
              <SwapsList>
                {vm.recommendedSwaps.map((swap) => (
                  <RecommendedSwapCard
                    key={swap.tokenAssetId}
                    swap={swap}
                    selected={selectedSwaps.has(swap.tokenAssetId)}
                    onToggle={handleToggleSwap}
                    onSourceTokenClick={handleSourceTokenClick}
                    onAmountChange={handleAmountChange}
                    sourceTokenLogo={vm.getSourceTokenLogo(swap.tokenAssetId)}
                    sourceTokenBalance={getSourceTokenBalance(swap)}
                    sendUsdValue={getSendUsdValue(swap)}
                    receiveUsdValue={getReceiveUsdValue(swap)}
                    priceImpact={getPriceImpact(swap)}
                    loading={vm.swapsLoading}
                  />
                ))}
              </SwapsList>

              <Button
                kind="primary"
                fixed
                onClick={handleSwapAll}
                disabled={vm.swapAllLoading || selectedCount === 0 || vm.swapsLoading}
              >
                {vm.swapAllLoading ? (
                  <>
                    Swapping Tokens <Loading />
                  </>
                ) : (
                  `Swap ${selectedCount} Token${selectedCount !== 1 ? "s" : ""}${totalUsd ? ` for ${totalUsd}` : ""}`
                )}
              </Button>
            </>
          )}
        </RecommendedSwapsContainer>
      )}

      <Dialog
        visible={vm.swapAllLoading && swapsInProgress.length > 0}
        onClose={() => {}}
        closable={false}
        title="Swapping Tokens"
        style={{ maxWidth: 360 }}
      >
        <ModalContent>
          <ProgressBar>
            <ProgressBarFill percent={(vm.swapProgress.current / vm.swapProgress.total) * 100} />
          </ProgressBar>

          <ProgressText>
            Processing {vm.swapProgress.current} of {vm.swapProgress.total} swaps
          </ProgressText>

          <SwapProgressList>
            {swapsInProgress.map((swap, index) => {
              const result = vm.swapResults[swap.tokenAssetId];
              const isDone = result === 'success';
              const isFailed = result === 'failed';
              const isActive = index === vm.swapProgress.current - 1 && !result;
              return (
                <SwapProgressItem key={swap.tokenAssetId} active={isActive} done={isDone} failed={isFailed}>
                  <SwapProgressIcon>
                    <img src={swap.tokenLogo} alt={swap.tokenSymbol} />
                  </SwapProgressIcon>
                  <Column>
                    <ModalTokenName style={{ fontSize: 14 }}>{swap.tokenSymbol}</ModalTokenName>
                    <ProgressText style={{ fontSize: 11 }}>
                      {swap.amountToSendFormatted} {swap.sourceToken.symbol} → {swap.amountToReceiveFormatted} {swap.tokenSymbol}
                    </ProgressText>
                  </Column>
                  <SwapProgressStatus done={isDone} failed={isFailed}>
                    {isDone ? "Done" : isFailed ? "Failed" : isActive ? <Loading /> : "Pending"}
                  </SwapProgressStatus>
                </SwapProgressItem>
              );
            })}
          </SwapProgressList>
        </ModalContent>
      </Dialog>

      <TokenSelectModal
        visible={tokenModalSwap !== null}
        onClose={() => setTokenModalSwap(null)}
        balances={getBalancesForModal()}
        onSelect={handleSourceTokenSelect}
        selectedTokenId={tokenModalSwap?.sourceToken.assetId}
      />
    </Root>
  );
};

export default observer(RecommendedSwaps);
