import styled from "@emotion/styled";
import SwapDetailRow from "@components/SwapDetailRow";
import Text from "@components/Text";
import { DCA } from "@src/constants";
import { useDcaVM } from "@screens/Trade/DcaVM";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";
import React from "react";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 16px;
  box-sizing: border-box;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary100};
`;

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${hours % 1 === 0 ? hours : hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} days`;
};

const DcaSummary: React.FC = () => {
  const vm = useDcaVM();
  const decimals0 = vm.token0?.decimals ?? 8;
  const decimals1 = vm.token1?.decimals ?? 8;

  const perSwap = BN.formatUnits(vm.netAmountPerSwap, decimals0);
  const fee = BN.formatUnits(vm.serviceFee, decimals0);
  const payment = BN.formatUnits(vm.tokenPayment, decimals0);
  const gas = BN.formatUnits(vm.executionGas, 8);

  return (
    <Root>
      <SwapDetailRow title="You pay in total">
        <Text weight={500} fitContent nowrap>
          {payment.toFormat(Math.min(6, decimals0))} {vm.token0?.symbol}
        </Text>
      </SwapDetailRow>
      <SwapDetailRow title={`Service fee (${DCA.serviceFeePercent}%)`}>
        <Text weight={500} fitContent nowrap>
          {fee.toFormat(Math.min(6, decimals0))} {vm.token0?.symbol}
        </Text>
      </SwapDetailRow>
      <SwapDetailRow title="Swapped per iteration">
        <Text weight={500} fitContent nowrap type={vm.amountTooSmall ? "error" : "primary"}>
          {perSwap.toFormat(Math.min(6, decimals0))} {vm.token0?.symbol}
        </Text>
      </SwapDetailRow>
      <SwapDetailRow title="Execution gas (prepaid, refundable)">
        <Text weight={500} fitContent nowrap type={vm.wavesError ? "error" : "primary"}>
          {gas.toFormat(3)} WAVES
        </Text>
      </SwapDetailRow>
      <SwapDetailRow title="Runs every">
        <Text weight={500} fitContent nowrap>
          ~{formatDuration(vm.intervalMinutes)} ({vm.blocksPerTrade} blocks)
        </Text>
      </SwapDetailRow>
      <SwapDetailRow title="Finishes in">
        <Text weight={500} fitContent nowrap>
          ~{formatDuration(vm.estimatedDurationMinutes)}
        </Text>
      </SwapDetailRow>
      <SwapDetailRow title="Current rate per iteration">
        <Text weight={500} fitContent nowrap type={vm.quoteError ? "error" : "primary"}>
          {vm.quoteError
            ? "no route"
            : vm.quotePerSwap == null
            ? "—"
            : `≈ ${BN.formatUnits(vm.quotePerSwap, decimals1).toFormat(Math.min(6, decimals1))} ${vm.token1?.symbol}`}
        </Text>
      </SwapDetailRow>
    </Root>
  );
};

export default observer(DcaSummary);
