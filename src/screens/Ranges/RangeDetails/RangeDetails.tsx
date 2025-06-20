import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import {
  RangeDetailsInterfaceVMProvider,
  useRangeDetailsInterfaceVM,
} from "./RangeDetailsVM";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import GoBack from "@components/GoBack";
import MainRangeInfo from "./MainRangeInfo";
import { Navigate, useParams } from "react-router-dom";
import Loading from "@components/Loading";
import { ROUTES } from "@src/constants";
import { useStores } from "@stores";
import RangeCharts from "./RangeCharts";
import RangeComposition from "./RangeComposition";
import Reward from "./Reward";
import MyRangeBalance from "./MyRangeBalance";
import LPStaking from "./LPStaking";
import Card from "@src/components/Card";
import RangeChart from "@src/components/RangeChart";
import useWindowSize from "@src/hooks/useWindowSize";
import RangeLiquidity from "./RangeLiquidity";
import EarnedByLP from "./EarnedByLP";

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
const RightBlock = styled(Column)`
  width: 100%;
  display: none;
  @media (min-width: 880px) {
    display: flex;
  }
`;
const Body = styled.div`
  width: 100%;
  display: flex;
  @media (min-width: 880px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 40px;
  }
`;
const RangeDetailsInterfaceImpl: React.FC = observer(() => {
  const vm = useRangeDetailsInterfaceVM();
  const { rangesStore } = useStores();
  const { width } = useWindowSize();
  const isMobile = !!(width && width < 880);
  if (rangesStore.ranges.length === 0 && vm.range == null) {
    return <Loading />;
  }
  if (rangesStore.ranges.length > 0 && vm.range == null) {
    return <Navigate to={ROUTES.NOT_FOUND} />;
  }
  return (
    <Layout>
      <Root>
        <GoBack link={ROUTES.RANGES} text="Back to Range list" />
        <SizedBox height={24} />
        {
          isMobile ? (
            <Column crossAxisSize="max">
              <MainRangeInfo isMobile />
              <SizedBox height={20} />
              <Row>
                <Card style={{ width: "auto", padding: "4px" }}>
                  <RangeChart range={vm.range!} size={120} />
                </Card>
                <SizedBox width={12} />
                <RangeLiquidity style={{ height: "130px", padding: "16px 20px" }} />
              </Row>
              <SizedBox height={12} />
              <EarnedByLP />
            </Column>
          ) : (
            <Column>
              <Row>
                <MainRangeInfo />
                <SizedBox width={20} />
                <Card style={{ width: "auto", padding: "19px" }}>
                  <RangeChart range={vm.range!} size={200} />
                </Card>
              </Row>
              <SizedBox height={20} />
              <Row alignItems="stretch">
                <RangeLiquidity />
                <SizedBox width={12} />
                <EarnedByLP />
              </Row>
            </Column>
          )
        }
        <Body>
          <MainBlock>
            {isMobile && <Column crossAxisSize="max">
              <Reward />
              <MyRangeBalance />
              <LPStaking />
            </Column>}
            <RangeCharts />
            <RangeComposition isMobile={isMobile} />
          </MainBlock>
          <RightBlock>
            <Reward />
            <MyRangeBalance />
            <LPStaking />
          </RightBlock>
        </Body>
      </Root>
    </Layout>
  );
});

const RangeDetailsInterface: React.FC = () => {
  const { rangeAddress } = useParams<{ rangeAddress: string }>();
  return (
    <RangeDetailsInterfaceVMProvider rangeAddress={rangeAddress ?? ""}>
      <RangeDetailsInterfaceImpl />
    </RangeDetailsInterfaceVMProvider>
  );
};

export default RangeDetailsInterface;
