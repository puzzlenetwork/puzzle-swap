import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import { useTradeInRangeVM } from "./TradeInRangeVM";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import Button from "@src/components/Button";

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
            Total liquidity
          </Text>
          <Text>$ {vm.range.liquidity.toFormat(0)}</Text>
        </Column>
        <Column crossAxisSize="max">
          <Text type="secondary" size="small">
            Total volume
          </Text>
          <Text>$ {vm.range.getVolume()?.toFormat(0)}</Text>
        </Column>
      </Row>
      <Link to="invest">
        <Button className="button" kind="secondary">
          Invest
        </Button>
      </Link>
    </Root>
  );
};
export default observer(Details);
