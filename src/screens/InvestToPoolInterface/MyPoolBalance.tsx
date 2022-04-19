import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import Button from "@components/Button";
import { AdaptiveColumn, AdaptiveRow, Column, Row } from "@src/components/Flex";
import Divider from "@src/components/Divider";
import { observer } from "mobx-react-lite";
import GridTable from "@components/GridTable";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import SquareTokenIcon from "@components/SquareTokenIcon";
import RoundTokenIcon from "@components/RoundTokenIcon";
import useWindowSize from "@src/hooks/useWindowSize";
import { Link } from "react-router-dom";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 24px;

  a {
    width: 100%;
  }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 0 24px;
`;
const Buttons = styled(Row)`
  box-sizing: border-box;
  padding: 16px;
  @media (min-width: 880px) {
    padding: 24px;
  }
`;

const MyPoolBalance: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { address, setLoginModalOpened } = accountStore;
  const vm = useInvestToPoolInterfaceVM();
  const { width: screenWidth } = useWindowSize();

  return (
    <Root>
      <Text weight={500} type="secondary">
        My pool balance
      </Text>
      <SizedBox height={8} />
      <Card paddingDesktop="24px 0 0" paddingMobile="16px 0 0">
        <Header>
          <Column crossAxisSize="max" style={{ flex: 1 }}>
            <Text weight={500}>Total value</Text>
          </Column>
          <Column>
            <Text textAlign="right" size="medium">
              {address != null ? `$${vm.totalRewardToClaim.toFixed(2)}` : "--"}
            </Text>
            <Text textAlign="right" type="secondary" size="small">
              Share of pool {vm.accountShareOfPool?.toFormat(2)}%
            </Text>
          </Column>
        </Header>
        <Divider style={{ margin: "16px 0" }} />
        <GridTable desktopTemplate="1fr 1fr" mobileTemplate="1fr 1fr">
          {vm.rewardToClaimTable.map((token, i) => {
            const reward = token.reward.gte(0.01)
              ? token.reward.toFormat(2)
              : token.reward.toFormat(6);
            const usd = token.usd.gte(0.01)
              ? token.usd.toFormat(2)
              : token.usd.toFormat(6);
            return (
              <div
                className="gridRow"
                key={i}
                style={{ padding: "8px 0", alignItems: "center" }}
              >
                <Row alignItems="center">
                  {screenWidth && screenWidth >= 880 ? (
                    <SquareTokenIcon size="small" src={token.logo} alt="logo" />
                  ) : (
                    <RoundTokenIcon src={token.logo} alt="logo" />
                  )}
                  <SizedBox width={8} />
                  <AdaptiveColumn>
                    <Text className="desktop" size="medium" nowrap>
                      {token.name}
                    </Text>
                    <Text type="secondary" size="small">
                      {token.symbol}
                    </Text>
                  </AdaptiveColumn>
                </Row>
                <AdaptiveRow>
                  <Row
                    style={{ width: "100%", textAlign: "end" }}
                    className="mobile"
                  >
                    <Text size="medium">
                      <span>{address !== null ? reward : "-"}</span>
                      <span style={{ color: "#8082C5" }}>
                        {address !== null ? `(${usd})` : "-"}
                      </span>
                    </Text>
                  </Row>
                  <Column
                    crossAxisSize="max"
                    className="desktop"
                    style={{ textAlign: "end" }}
                  >
                    <Text size="medium">{address !== null ? reward : "-"}</Text>
                    <Text size="small" type="secondary">
                      {/*${usd}*/}
                      {address !== null ? usd : "-"}
                    </Text>
                  </Column>
                </AdaptiveRow>
              </div>
            );
          })}
        </GridTable>
        <SizedBox height={16} />
        <Divider />
        <Buttons>
          {address != null ? (
            <>
              <Link to={`/${vm.pool.id}/withdraw`}>
                <Button fixed size="medium" kind="secondary">
                  Withdraw
                </Button>
              </Link>
              <SizedBox width={8} />
              <Link to={`/${vm.pool.id}/addLiquidity`}>
                <Button fixed size="medium">
                  Deposit
                </Button>
              </Link>
            </>
          ) : (
            <Column crossAxisSize="max">
              <Text textAlign="center" type="secondary">
                Connect your wallet to invest
              </Text>
              <SizedBox height={16} />
              <Button
                fixed
                size="medium"
                onClick={() => setLoginModalOpened(true)}
              >
                Connect wallet
              </Button>
            </Column>
          )}
        </Buttons>
      </Card>
    </Root>
  );
};
export default observer(MyPoolBalance);
