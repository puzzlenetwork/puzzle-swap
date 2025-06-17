import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import DepositMultipleTokensAmountSelector from "./DepositMultipleTokensAmountSelctor";
import { Row } from "@components/Flex";
import GridTable from "@components/GridTable";
import Divider from "@components/Divider";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import Loading from "@components/Loading";
import { useDepositToRangeVM } from "../DepositToRangeVM";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import DepositCompositionRow from "./DepositCompositionRow";
import MultipleTokensNotifications from "./MultipleTokensNotifications";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AdaptiveRowWithPadding = styled(Row)`
  width: calc(100% - 32px);
  padding: 16px;
  @media (min-width: 880px) {
    width: calc(100% - 48px);
    padding: 24px;
  }
`;

const HideDesktop = styled.div`
  display: flex;
  @media (min-width: calc(560px + 32px)) {
    display: none;
  }
`;
const FixedMobileBlock = styled.div`
  display: flex;
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  justify-content: center;
  padding: 0 16px 16px;
  @media (min-width: calc(560px + 32px)) {
    position: relative;
    padding: 0;
    bottom: 0;
  }
`;

const MultipleTokensAddLiquidity: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useDepositToRangeVM();
  const assets = vm.range.assets ?? [];
  const handleConnectToWallet = () => accountStore.setLoginModalOpened(true);
  if (accountStore.address == null)
    return (
      <Button fixed onClick={handleConnectToWallet}>
        Connect Wallet
      </Button>
    );
  return (
    <Root>
      <DepositMultipleTokensAmountSelector />
      <SizedBox height={24} />
      <Text style={{ width: "100%" }} weight={500} type="secondary">
        Deposit composition
      </Text>
      <SizedBox height={8} />
      <Card paddingMobile="0" paddingDesktop="8px 0">
        <GridTable desktopTemplate={"1fr 1fr"} mobileTemplate={"1fr 1fr"}>
          <MultipleTokensNotifications />
          {assets.map((token, i) => {
            const balance = accountStore.findBalanceByAssetId(token.assetId);
            const available =
              balance &&
              balance.balance &&
              BN.formatUnits(balance?.balance, TOKENS_BY_ASSET_ID[token.assetId].decimals);

            const depositAmount =
              vm.tokensToDepositAmounts &&
              vm.tokensToDepositAmounts[token.assetId];
            return (
              <DepositCompositionRow
                key={i}
                name={token.name}
                availableAmount={available}
                depositAmount={depositAmount}
                share={token.share}
                logo={TOKENS_BY_ASSET_ID[token.assetId].logo}
              />
            );
          })}
        </GridTable>
        <Divider />
        <AdaptiveRowWithPadding justifyContent="space-between">
          <Text fitContent>Total value</Text>
          <Text weight={500} fitContent nowrap>
            {vm.totalAmountToDeposit}
          </Text>
        </AdaptiveRowWithPadding>
      </Card>
      <SizedBox height={24} />

      <HideDesktop>
        <SizedBox height={56} />
      </HideDesktop>
      <FixedMobileBlock>
        {!vm.loading ? (
          <Button
            fixed
            disabled={!vm.canDepositMultipleTokens}
            onClick={vm.depositMultipleTokens}
          >
            Deposit {vm.totalAmountToDeposit ?? "$ 0.0"}
          </Button>
        ) : (
          <Button disabled fixed>
            Transaction in progress <Loading />
          </Button>
        )}
      </FixedMobileBlock>
    </Root>
  );
};
export default observer(MultipleTokensAddLiquidity);
