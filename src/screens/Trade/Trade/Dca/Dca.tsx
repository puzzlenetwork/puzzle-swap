import styled from "@emotion/styled";
import Button from "@components/Button";
import Card from "@components/Card";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { DCA } from "@src/constants";
import { useDcaVM } from "@screens/Trade/DcaVM";
import DcaAmountInput from "@screens/Trade/Trade/Dca/DcaAmountInput";
import DcaDisclaimer from "@screens/Trade/Trade/Dca/DcaDisclaimer";
import DcaNumberInput from "@screens/Trade/Trade/Dca/DcaNumberInput";
import DcaSessions from "@screens/Trade/Trade/Dca/DcaSessions";
import DcaSummary from "@screens/Trade/Trade/Dca/DcaSummary";
import DcaTokens from "@screens/Trade/Trade/Dca/DcaTokens";
import SettingsHeader from "@screens/Trade/Trade/SettingsHeader";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React from "react";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  max-width: 560px;
`;

const Schedule = styled(Row)`
  gap: 12px;
  flex-direction: column;

  @media (min-width: 560px) {
    flex-direction: row;
  }
`;

const Dca: React.FC = () => {
  const vm = useDcaVM();
  const { accountStore } = useStores();
  const decimals0 = vm.token0?.decimals ?? 8;
  const decimals1 = vm.token1?.decimals ?? 8;

  const buttonText = () => {
    if (accountStore.address == null) return "Connect wallet";
    if (vm.loading) return "In progress…";
    return vm.error ?? "Start DCA";
  };

  const handleClick = () => {
    if (accountStore.address == null) {
      accountStore.setWalletModalOpened(true);
      return;
    }
    vm.start();
  };

  return (
    <Root>
      <Card style={{ position: "relative" }} paddingDesktop="16px 24px" paddingMobile="16px">
        <SettingsHeader />
        <DcaDisclaimer />
        <SizedBox height={16} />
        <DcaTokens />
        <SizedBox height={16} />
        <DcaAmountInput
          label="Total amount to spend"
          hint={`Balance: ${accountStore.findBalanceByAssetId(vm.assetId0)?.formatBalance ?? "—"}`}
          decimals={decimals0}
          amount={vm.totalAmount}
          setAmount={vm.setTotalAmount}
          suffix={vm.token0?.symbol}
          error={vm.amountError || vm.amountTooSmall}
          onMaxClick={() => vm.setTotalAmount(vm.balance0)}
        />
        <SizedBox height={16} />
        <Schedule>
          <DcaNumberInput
            label="Number of swaps"
            value={vm.swaps}
            setValue={vm.setSwaps}
            min={DCA.minSwaps}
            max={DCA.maxSwaps}
            error={vm.swapsError}
          />
          <DcaNumberInput
            label="Interval"
            hint={`~${vm.intervalMinutes} min`}
            value={vm.blocksPerTrade}
            setValue={vm.setBlocksPerTrade}
            suffix="blocks"
            min={DCA.minBlocksPerTrade}
            max={DCA.maxBlocksPerTrade}
            error={vm.blocksError}
          />
        </Schedule>
        <SizedBox height={16} />
        <DcaAmountInput
          label="Minimum received per swap"
          hint={
            vm.quotePerSwap == null
              ? undefined
              : `now ≈ ${BN.formatUnits(vm.quotePerSwap, decimals1).toFormat(Math.min(6, decimals1))}`
          }
          decimals={decimals1}
          amount={vm.minOut}
          setAmount={vm.setMinOut}
          suffix={vm.token1?.symbol}
          error={vm.minOutError && vm.totalAmount.gt(0)}
        />
        <SizedBox height={4} />
        <Text size="small" type="secondary">
          A swap is skipped whenever the aggregator quote falls below this floor. Keep it low enough to survive normal
          price moves — you can raise or lower it later without stopping the session.
        </Text>
        <SizedBox height={16} />
        <DcaSummary />
        <SizedBox height={16} />
        <Button fixed disabled={accountStore.address != null && !vm.canStart} onClick={handleClick}>
          {buttonText()}
        </Button>
      </Card>

      <SizedBox height={24} />
      <DcaSessions />
    </Root>
  );
};

export default observer(Dca);
