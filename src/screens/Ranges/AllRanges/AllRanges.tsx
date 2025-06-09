import styled from "@emotion/styled";
import React from "react";
import Layout from "@components/Layout";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { AllRangesProvider } from "@screens/Ranges/AllRanges/AllRangesVm";
import { Column, Row } from "@src/components/Flex";
import { ROUTES } from "@src/constants";
import Img from "@components/Img";
import Button from "@components/Button";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import Card from "@components/Card";
import Input from "@components/Input";
import SearchAndFilterTab from "@screens/Ranges/AllRanges/SearchAndFilterTab";
import RangesTable from "./RangesTable";

interface IProps { }

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
const Stats = styled.div<{ loggedIn?: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 880px) {
    grid-template-columns: ${({ loggedIn }) =>
    loggedIn ? "1fr 1fr 1fr" : "1fr 1fr"};
  }
`;
const Filters = styled.div<{ loggedIn?: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 880px) {
    grid-template-columns: ${({ loggedIn }) =>
    loggedIn ? "1fr 1fr 1fr" : "1fr 1fr"};
  }
`;
const AllRangesImpl: React.FC<IProps> = () => {
  const { poolsStore, accountStore } = useStores();
  const theme = useTheme();
  const navigate = useNavigate();
  const stats = [
    {
      title: "Number Of Ranges",
      value: "1000",
    },
    {
      title: "Total Fact / Virtual Liquidity",
      value: "$999,999.99 / $999,999.99 ",
    },
  ];
  return (
    <Layout>
      <Observer>
        {() => (
          <Root
            apySort={poolsStore.sortApy}
            liquiditySort={poolsStore.sortLiquidity}
            balanceSort={poolsStore.sortBalance}
          >
            <Row justifyContent="space-between" alignItems="center">
              <Column>
                <Text weight={500} size="large">
                  Explore and Manage
                  <a style={{ color: "#7075E9", paddingLeft: 4 }}>
                    Puzzle Ranges
                  </a>
                </Text>
                <SizedBox height={4} />
                <Subtitle size="medium" fitContent>
                  View your active liquidity ranges or discover opportunities
                  created by others.
                  <br />
                  Analyze token usage by price range, and decide where to
                  provide concentrated liquidity in the Puzzle ecosystem.
                </Subtitle>
              </Column>
              <Button onClick={() => navigate(`${ROUTES.RANGES_CREATE}`)}>
                <Img src={theme.images.icons.add} alt="add" />
                <SizedBox width={12} />
                Create a range
              </Button>
            </Row>
            <SizedBox height={32} />
            <Stats loggedIn={accountStore.address != null}>
              {accountStore.address != null && (
                <Card
                  paddingDesktop="16px 20px"
                  type="image"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Column>
                    <Text type="secondary">My Investment Balance</Text>
                    <SizedBox height={4} />
                    <Text size="big" type="light">
                      $3167.23
                    </Text>
                  </Column>
                  <Button
                    onClick={() => navigate(`${ROUTES.USER_RANGES}`)}
                    size="medium"
                  >
                    My Ranges
                  </Button>
                </Card>
              )}
              {stats.map(({ title, value }) => (
                <Card paddingDesktop="16px 20px">
                  <Text type="secondary">{title}</Text>
                  <SizedBox height={4} />
                  <Text size="big">{value}</Text>
                </Card>
              ))}
            </Stats>
            <SizedBox height={32} />
            <SearchAndFilterTab />
            <SizedBox height={32} />
            <RangesTable />
            {/*<PoolsTable />*/}
          </Root>
        )}
      </Observer>
    </Layout>
  );
};

const AllRanges: React.FC<IProps> = () => (
  <AllRangesProvider>
    <AllRangesImpl />
  </AllRangesProvider>
);
export default AllRanges;
