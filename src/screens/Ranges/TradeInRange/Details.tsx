import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import styled from "@emotion/styled";
import Button from "@src/components/Button";
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import { useTradeInRangeVM } from "./TradeInRangeVM";

const Root = styled(Card)`
  display: flex;
  flex-direction: column;
  max-width: 560px;
  @media (min-width: 560px) {
    align-items: center;
    flex-direction: row;
    padding: 22px 32px;
  }

  .button {
    width: 100%;
    margin-top: 12px;
    height: 40px;
    @media (min-width: 560px) {
      max-width: 120px;
    }
  }
`;

const Details: React.FC = () => {
  const vm = useTradeInRangeVM();
  if (vm.range == null) return null;
  return (
    <Root>
      <Row alignItems="center">
        <Column crossAxisSize="max">
          <Text type="secondary" size="small">
            Range Fact/Virtual Liquidity
          </Text>
          <Row>
            <Text fitContent>
              ${vm.range.liquidity.toFormat(0)} /{" "}
              <Text fitContent type="secondary" style={{ display: "inline" }}>
                ${vm.range.virtualLiquidity.toFormat(0)}
              </Text>
            </Text>
          </Row>
        </Column>
        <Column crossAxisSize="max">
          <Text type="secondary" size="small">
            Total volume
          </Text>
          <Text>${vm.range.getVolume()?.toFormat(0)}</Text>
        </Column>
      </Row>
      <Link to="details">
        <Button className="button" kind="secondary">
          Invest
        </Button>
      </Link>
    </Root>
  );
};
export default observer(Details);
