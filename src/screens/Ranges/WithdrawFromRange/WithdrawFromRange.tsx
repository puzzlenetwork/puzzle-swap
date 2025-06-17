import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import {
  useWithdrawFromRangeVM,
  WithdrawFromRangeVMProvider
} from "./WithdrawFromRangeVM";
import ShortPoolInfoCard from "@components/ShortPoolInfoCard";
import WithdrawLiquidityAmount from "./WithdrawLiquidityAmount";
import WithdrawLiquidityTable from "./WithdrawLiquidityTable";
import Button from "@components/Button";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import GoBack from "@components/GoBack";
import Loading from "@components/Loading";
import { ROUTES } from "@src/constants";
import BN from "@src/utils/BN";
import ChangePoolModal from "@src/components/ChangePoolModal";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
        <GoBack
          link={`/ranges/${vm.rangeAddress}/invest`}
          text="Back to Range Info"
        />
        <SizedBox height={24} />
        <Text weight={500} size="large">
          Withdraw liquidity
        </Text>
        <SizedBox height={4} />
        <Text size="medium">
          Select the percentage of assets you want to withdraw from the pool
        </Text>
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
  const { rangeAddress } = useParams<{ rangeAddress: string }>();
  return (
    <WithdrawFromRangeVMProvider rangeAddress={rangeAddress ?? ""}>
      <WithdrawFromRange />
    </WithdrawFromRangeVMProvider>
  );
};

export default observer(WithdrawLiquidityInterface);
