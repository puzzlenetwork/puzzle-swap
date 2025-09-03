import styled from "@emotion/styled";
import React, { useMemo } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { useCreateRangeVM } from "../../CreateRangeVm";
import { observer } from "mobx-react-lite";
import Slider from "@components/Slider";
import { Row } from "@src/components/Flex";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddLiquidityToRangeAmountSelector: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();
  const providedUsd = useMemo(
    () => vm.maxToProvide.times(vm.providedPercentOfPool).div(100),
    [vm.maxToProvide, vm.providedPercentOfPool]
  );
  return (
    <Root>
      <Text style={{ width: "100%" }} weight={500} type="secondary">
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
            {`${vm.providedPercentOfPool}%`}
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
          value={vm.providedPercentOfPool.toNumber()}
          onChange={vm.setProvidedPercentOfPool}
        />
      </Card>
    </Root>
  );
};
export default observer(AddLiquidityToRangeAmountSelector);
