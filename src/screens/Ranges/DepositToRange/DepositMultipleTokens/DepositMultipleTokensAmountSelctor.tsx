import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import Slider from "@components/Slider";
import { useDepositToRangeVM } from "../DepositToRangeVM";
import { observer } from "mobx-react-lite";
import { Row } from "@src/components/Flex";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const MultipleTokensAddLiquidityAmount: React.FC<IProps> = () => {
  const vm = useDepositToRangeVM();
  return (
    <Root>
      <Text weight={500} type="secondary">
        Amount
      </Text>
      <SizedBox height={8} />
      <Card>
        <Text type="secondary" style={{ textAlign: "center" }} size="medium">
          Select the percentage of your assets
        </Text>
        <SizedBox height={16} />
        <Row justifyContent="center" style={{ flexWrap: "wrap" }}>
          <Text type="primary" size="large" fitContent>
            {`${vm.percentToDeposit}% `}
          </Text>
          <SizedBox width={18} />
          <Text type="secondary" size="large" fitContent nowrap>
            {`(${vm.totalAmountToDepositStr} ≈ $ ${vm.totalAmountToDepositUsd?.toBigFormat(2)})`}
          </Text>
        </Row>
        <SizedBox height={16} />
        <Slider
          min={0}
          max={100}
          step={1}
          marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
          value={vm.percentToDeposit.toNumber()}
          onChange={vm.setPercentToDeposit}
        />
      </Card>
    </Root>
  );
};
export default observer(MultipleTokensAddLiquidityAmount);
