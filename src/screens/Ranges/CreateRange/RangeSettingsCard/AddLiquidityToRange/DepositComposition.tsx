import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import GridTable from "@components/GridTable";
import BN from "@src/utils/BN";
import Divider from "@components/Divider";
import { useCreateRangeVM } from "../../CreateRangeVm";
import { useStores } from "@stores";
import AddTokenRow from "./AddTokenRow";
import { Row } from "@components/Flex";
import { observer } from "mobx-react-lite";
import Notification from "@components/Notification";
import LowBalanceNotifications from "./LowBalanceNotifications";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AdaptiveRowWithPadding = styled(Row)`
  box-sizing: border-box;
  padding: 16px;
  @media (min-width: 880px) {
    padding: 24px;
  }
`;

const DepositComposition: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();
  const { accountStore } = useStores();
  return (
    <Root>
      {vm.maxToProvide.eq(new BN(0)) && (
        <Notification
          type="warning"
          text={
            <Text size="medium">
              Please get all tokens to launch a range.
              {/*<Link to={ROUTES.TRADE}>*/}
              {/*  <TextButton kind="secondary">Go to trade.</TextButton>*/}
              {/*</Link>*/}
            </Text>
          }
        />
      )}
      <SizedBox height={24} />
      <Text style={{ width: "100%" }} weight={500} type="secondary">
        Deposit composition
      </Text>
      <SizedBox height={8} />
      <Card paddingMobile="0" paddingDesktop="8px 0">
        <GridTable desktopTemplate={"1fr 1fr"} mobileTemplate={"1fr 1fr"}>
          <LowBalanceNotifications />
          {vm.rangeAssets.map((token, i) => {
            const depositAmount = vm.assetsToProvide[token.asset.assetId];
            return (
              <AddTokenRow
                symbol={token.asset.symbol}
                key={i}
                availableAmount={token.inWallet ?? BN.ZERO}
                depositPrefix=""
                depositAmount={depositAmount}
                percent={token.share.div(10).toNumber()}
                logo={token.asset.logo}
              />
            );
          })}
        </GridTable>
        <Divider />
        <AdaptiveRowWithPadding>
          <Text>Total value</Text>
          <Text weight={500} fitContent nowrap>
            {vm.totalAmountToDepositStr}
          </Text>
          <SizedBox width={4} />
          <Text weight={500} fitContent nowrap type="secondary">
            ≈ $ {vm.totalAmountToDepositUsd?.toBigFormat(2) ?? "0.00"}
          </Text>
        </AdaptiveRowWithPadding>
      </Card>
    </Root>
  );
};
export default observer(DepositComposition);
