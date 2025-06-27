import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import { useCreateRangeVM } from "../../CreateRangeVm";
import { observer } from "mobx-react-lite";
import sandClock from "@src/assets/icons/sandClock.svg";
import TokenInCreateRangePreview from "./TokenInCreateRangePreview";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const YourRange: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();
  return (
    <Root>
      <Text style={{ width: "100%" }} weight={500} type="secondary">
        Your Range
      </Text>
      <SizedBox height={8} />
      <Card>
        <Row alignItems="center">
          <Card paddingDesktop="14px" paddingMobile="14px" fitContent>
            <img src={sandClock} alt="range" width={24} height={24} />
          </Card>
          <SizedBox width={12} />
          <Column>
            <Text weight={500}>Range {vm.domain}</Text>
            <Text type="secondary">
              Swap fees: {vm.swapFee.div(10).toString()}%
            </Text>
          </Column>
        </Row>
        <SizedBox height={12} />
        <Row style={{ flexWrap: "wrap", gap: 4 }}>
          {vm.rangeAssets.map((asset, index) => (
            <TokenInCreateRangePreview
              key={index}
              asset={asset}
              isBaseToken={index === 0}
            />
          ))}
        </Row>
      </Card>
    </Root>
  );
};
export default observer(YourRange);
