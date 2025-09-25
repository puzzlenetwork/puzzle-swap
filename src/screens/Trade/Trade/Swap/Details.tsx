import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";
import { Link } from "react-router-dom";

import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { useSwapVM } from "@screens/Trade/SwapVM";
import { ROUTES } from "@src/constants";

const Root = styled(Card)`
  display: flex;
  flex-direction: column;
  max-width: 560px;
  @media (min-width: 560px) {
    align-items: center;
    flex-direction: column;
    padding: 22px 32px;
  }

  .button {
    width: 100%;
    margin-top: 12px;
    height: 40px;
  }
`
  const RowButton = styled(Row)`
    gap: 10px;
    display: flex;
    width: 100%;
    
    a {
      flex: 1;
    }
`;

const Details: React.FC = () => {
  const { poolsStore } = useStores();
  const vm = useSwapVM();

  return (
    <Root>
      <Row alignItems="center">
        <Column crossAxisSize="max">
          <Text type="secondary" size="small">
            Total liquidity
          </Text>
          <Text>$ {vm.totalLiquidity}</Text>
        </Column>
        <Column crossAxisSize="max">
          <Text type="secondary" size="small">
            Total volume
          </Text>
          <Text>$ {poolsStore.globalVolume.toFormat(2)}</Text>
        </Column>
      </Row>
      <RowButton>
        <Link to={ROUTES.POOLS}>
          <Button className="button" kind="secondary">
            Pools
          </Button>
        </Link>
        <Link to={ROUTES.RANGES}>
          <Button className="button" kind="secondary">
            Ranges
          </Button>
        </Link>
      </RowButton>
    </Root>
  );
};
export default observer(Details);
