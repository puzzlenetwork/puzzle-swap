import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import SearchAndFilterTab from "@screens/Invest/SearchAndFilterTab";
import { InvestVMProvider, useInvestVM } from "./InvestVm";
import PoolsTable from "@screens/Invest/PoolsTable";
import { Observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div<{ apySort?: boolean; liquiditySort?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const InvestImpl: React.FC<IProps> = () => {
  const vm = useInvestVM();
  return (
    <Layout>
      <Observer>
        {() => (
          <Root apySort={vm.sortApy} liquiditySort={vm.sortLiquidity}>
            <Text weight={500} size="large">
              Invest in Puzzle Mega Pools
            </Text>
            <SizedBox height={4} />
            <Text size="medium" type="secondary">
              Select a pool to invest
            </Text>
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
