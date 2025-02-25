import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import SearchAndFilterTab from "@screens/Invest/SearchAndFilterTab";
import { InvestVMProvider, useInvestVM } from "./InvestVm";
import { Observer } from "mobx-react-lite";
import { useStores } from "@stores";
import AccountInvestBalance from "@screens/Invest/AccountInvestBalance";
import PoolsTable from "./PoolsTable";

interface IProps {}

const Root = styled.div<{
  apySort?: boolean;
  liquiditySort?: boolean;
  balanceSort?: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1160px + 32px);
  margin-bottom: 24px;
  margin-top: 40px;
  text-align: left;
  @media (min-width: 880px) {
    margin-top: 56px;
  }

  .balance-group {
    width: 20px;
    height: 20px;
    transform: ${({ balanceSort }) =>
      balanceSort ? "scale(1)" : "scale(1, -1)"};
  }

  .apy-group {
    width: 20px;
    height: 20px;
    transform: ${({ apySort }) => (apySort ? "scale(1)" : "scale(1, -1)")};
  }

  .liquidity-group {
    width: 20px;
    height: 20px;
    transform: ${({ liquiditySort }) =>
      liquiditySort ? "scale(1)" : "scale(1, -1)"};
  }
`;
const Subtitle = styled(Text)`
  @media (min-width: 880px) {
    max-width: 560px;
  }
`;
const InvestImpl: React.FC<IProps> = () => {
  const { accountStore, poolsStore } = useStores();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root
            apySort={poolsStore.sortApy}
            liquiditySort={poolsStore.sortLiquidity}
            balanceSort={poolsStore.sortBalance}
          >
            <Text weight={500} size="large">
              Puzzle Megapools
            </Text>
            <SizedBox height={4} />
            <Subtitle size="medium"fitContent>
              Unlike the old school AMM pools, megapools enable liquidity provision in up to 10 tokens in order to maximize LP profit.
            </Subtitle>
            {accountStore.address != null && <AccountInvestBalance />}
            <SizedBox height={24} />
            <SearchAndFilterTab />
            <SizedBox height={16} />
            <PoolsTable />
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const Invest: React.FC<IProps> = () => (
  <InvestVMProvider>
    <InvestImpl />
  </InvestVMProvider>
);
export default Invest;
