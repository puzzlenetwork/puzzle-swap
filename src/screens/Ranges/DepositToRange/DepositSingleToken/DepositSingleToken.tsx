import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { observer } from "mobx-react-lite";
import { useDepositToRangeVM } from "../DepositToRangeVM";
import { useStores } from "@stores";
import Button from "@components/Button";
import Notification from "@components/Notification";
import TokenInput from "@components/TokenInput";
import Loading from "@components/Loading";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const DepositSingleToken: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useDepositToRangeVM();
  const selectedToken = vm.selectedTokenToDeposit!;

  const handleCallDepositSingleToken = async () => {
    await vm.depositSingleToken();
  };

  return (
    <Root>
      <Text weight={500} type="secondary">
        Amount
      </Text>
      <SizedBox height={8} />
      <Card>
        <TokenInput
          selectable={false}
          decimals={selectedToken.decimals}
          amount={vm.singleTokenAmount}
          setAmount={vm.setSingleTokenAmount}
          assetId={selectedToken.assetId}
          balances={vm.balances ?? []}
          onMaxClick={vm.onMaxSingleTokenClick}
          usdnEquivalent={vm.selectedTokenAmountUsdnEquivalent}
        />
        <SizedBox height={24} />
        <Notification
          type="info"
          text={`Your ${vm.selectedTokenToDeposit?.symbol} will be automatically converted to other pool
        tokens and provided as liquidity. Please pay attention that value of
        your deposit can be different from value of tokens provided because of
        slippage. We do not recommend to use this method for bigger amounts.`}
        />
      </Card>
      <SizedBox height={24} />
      {accountStore.address == null && (
        <Button fixed onClick={() => accountStore.setLoginModalOpened(true)}>
          Connect to deposit
        </Button>
      )}
      {accountStore.address != null &&
        (!vm.loading ? (
          <Button
            fixed
            onClick={handleCallDepositSingleToken}
            disabled={!vm.canDepositSingleToken}
          >
            Deposit
          </Button>
        ) : (
          <Button disabled fixed>
            Transaction in progress <Loading />
          </Button>
        ))}
    </Root>
  );
};
export default observer(DepositSingleToken);
