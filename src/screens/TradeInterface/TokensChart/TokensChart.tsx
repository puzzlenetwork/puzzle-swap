import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import { useTradeVM } from "@screens/TradeInterface/TradeVM";
import { observer } from "mobx-react-lite";
import useCollapse from "react-collapsed";
import SizedBox from "@components/SizedBox";
import SquareTokenIcon from "@components/SquareTokenIcon";
import SwitchTokensButton from "@screens/TradeInterface/SwitchTokensButton";
import ChartAgeButtons from "@components/ChartAgeButtons";
import link from "@src/assets/icons/link.svg";
import { useNavigate } from "react-router-dom";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 660px;

  .icon {
    cursor: pointer;
    transition: 0.4s;
  }

  .age-btns {
    max-width: 296px;
  }
`;
const Link = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer; ;
`;

const TokensChart: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const { getCollapseProps } = useCollapse({
    isExpanded: vm.openedChart,
    duration: 500,
  });
  const navigate = useNavigate();
  return (
    <Root {...getCollapseProps()}>
      <Card style={{ minHeight: " 100 %" }}>
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center">
            <Text
              weight={500}
              fitContent
            >{`${vm.token0.symbol}/${vm.token1.symbol}`}</Text>
            <SizedBox width={8} />
            <SwitchTokensButton new />
          </Row>
          <ChartAgeButtons
            className="age-btns"
            value="1d"
            onChange={() => null}
          />
        </Row>
      </Card>
      <SizedBox height={16} />
      <Row style={{ gap: 16 }}>
        {[vm.token0, vm.token1].map((t) => (
          <Card
            key={t.assetId}
            alignItems="center"
            justifyContent="space-between"
            flexDirection="row"
          >
            <Row alignItems="center">
              <SquareTokenIcon size="small" src={t.logo} />
              <SizedBox width={12} />
              <Column>
                <Text size="medium" weight={500}>
                  Learn more about {t.symbol}
                </Text>
                <Text size="small" type="secondary">
                  Open in Explore
                </Text>
              </Column>
              <SizedBox width={12} />
            </Row>
            <Link
              src={link}
              alt="link"
              onClick={() => navigate(`/explore/token/${t.assetId}`)}
            />
          </Card>
        ))}
      </Row>
    </Root>
  );
};
export default observer(TokensChart);
