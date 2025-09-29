import Button from "@components/Button";
import GoBack from "@components/GoBack";
import Layout from "@components/Layout";
import Loading from "@components/Loading";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import styled from "@emotion/styled";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import { useWithdrawFromRangeVM, WithdrawFromRangeVMProvider } from "./WithdrawFromRangeVM";
import WithdrawLiquidityAmount from "./WithdrawLiquidityAmount";
import WithdrawLiquidityTable from "./WithdrawLiquidityTable";
import { domainToUrlSafe, urlSafeToOriginalDomain } from "@src/utils/rangeUrlUtils";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  min-height: 100%;
  margin-bottom: 24px;
  margin-top: 40px;
  width: 100%;
  max-width: calc(560px + 32px);
  box-sizing: border-box;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const WithdrawFromRange = observer(() => {
  const vm = useWithdrawFromRangeVM();
  const { accountStore } = useStores();
  if (vm.range == null) {
    return <Loading />;
  }
  return (
    <Layout>
      <Root>
        <GoBack link={`/ranges/${domainToUrlSafe(vm.range.domain)}/details`} text={`Back to range ${vm.range.domain}`} />
        <SizedBox height={24} />
        <Text weight={500} size="large">
          Withdraw liquidity
        </Text>
        <SizedBox height={4} />
        <Text size="medium">Select the percentage of assets you want to withdraw from the pool</Text>
        <SizedBox height={24} />
        {accountStore.address != null ? (
          <>
            <WithdrawLiquidityAmount />
            <SizedBox height={24} />
            <WithdrawLiquidityTable />
          </>
        ) : (
          <Button fixed onClick={() => accountStore.setLoginModalOpened(true)}>
            Connect wallet to withdraw
          </Button>
        )}
      </Root>
    </Layout>
  );
});

const WithdrawLiquidityInterface: React.FC = () => {
  const { rangeDomain } = useParams<{ rangeDomain: string }>();
  const decodedRangeDomain = rangeDomain ? urlSafeToOriginalDomain(rangeDomain) : "";
  const { rangesStore } = useStores();
  const range = rangesStore.getRangeByDomain(decodedRangeDomain);
  const rangeAddress = range?.address ?? "";
  
  return (
    <WithdrawFromRangeVMProvider rangeAddress={rangeAddress}>
      <WithdrawFromRange />
    </WithdrawFromRangeVMProvider>
  );
};

export default observer(WithdrawLiquidityInterface);
