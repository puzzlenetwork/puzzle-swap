import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import {
  InvestToRangeInterfaceVMProvider,
  useInvestToRangeInterfaceVM,
} from "./InvestToRangeInterfaceVM";
import SizedBox from "@components/SizedBox";
import { Column } from "@src/components/Flex";
import GoBack from "@components/GoBack";
import MainRangeInfo from "./MainRangeInfo";
import { Navigate, useParams } from "react-router-dom";
import Loading from "@components/Loading";
import { ROUTES } from "@src/constants";
import { useStores } from "@stores";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1160px + 32px);
  margin-bottom: 24px;
  margin-top: 56px;
  text-align: left;

  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;
const MainBlock = styled.div`
  width: 100%;
`;
const RightBlockMobile = styled(Column)`
  width: 100%;
  @media (min-width: 880px) {
    display: none;
  }
`;
const RightBlock = styled(Column)`
  width: 100%;
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const Body = styled.div`
  width: 100%;
  display: grid;
  @media (min-width: 880px) {
    grid-template-columns: 2fr 1fr;
    column-gap: 40px;
  }
`;
const InvestToRangeInterfaceImpl: React.FC = observer(() => {
  const vm = useInvestToRangeInterfaceVM();
  const { rangesStore } = useStores();
  if (rangesStore.ranges.length === 0 && vm.range == null) {
    return <Loading />;
  }
  if (rangesStore.ranges.length > 0 && vm.range == null) {
    return <Navigate to={ROUTES.NOT_FOUND} />;
  }
  return (
    <Layout>
      <Root>
        <GoBack link={ROUTES.POOLS} text="Back to AllRanges list" />
        <SizedBox height={24} />
        <MainRangeInfo />
        {/* <Boosting />
        <PoolInformation />
        <Body>
          <MainBlock>
            <RightBlockMobile>
              <Reward />
              <MyPoolBalance />
              <LPStaking />
            </RightBlockMobile>
            <TradesVolume />
            <PoolComposition />
            <PoolHistory />
          </MainBlock>
          <RightBlock>
            <Reward />
            <MyPoolBalance />
            <LPStaking />
          </RightBlock>
        </Body> */}
      </Root>
    </Layout>
  );
});

const InvestToRangeInterface: React.FC = () => {
  const { rangeAddress } = useParams<{ rangeAddress: string }>();
  return (
    <InvestToRangeInterfaceVMProvider rangeAddress={rangeAddress ?? ""}>
      <InvestToRangeInterfaceImpl />
    </InvestToRangeInterfaceVMProvider>
  );
};

export default InvestToRangeInterface;
