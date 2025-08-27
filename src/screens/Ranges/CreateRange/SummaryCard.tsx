import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import styled from "@emotion/styled";
import Divider from "@src/components/Divider";
import { Row } from "@src/components/Flex";
import RangeChart from "@src/components/RangeChart";
import RoundTokenIcon from "@src/components/RoundTokenIcon";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useCreateRangeVM } from "./CreateRangeVm";
import LowRangeLiquidityNotification from "@src/components/LowRangeLiquidityNotification";
import DepositComposition from "./RangeSettingsCard/AddLiquidityToRange/DepositComposition";

interface IProps {}

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Legend = styled(Row)`
  max-width: 155px;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;

  & > * {
    padding-right: 12px;
  }
`;

const GrayCard = styled(Card)`
  background: ${({ theme }) => theme.colors.primary100};
  border: none;
  width: fit-content;
  padding: 5px;
`;

const SummaryCard: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();

  const showLowRangeLiquidityNotification = useMemo(() => vm.maxToProvideUsd.lt(100), [vm.maxToProvideUsd]);

  return (
    <Root>
      <Text type="secondary" weight={500}>
        Summary
      </Text>
      <SizedBox height={8} />
      <Card justifyContent="center" alignItems="center" paddingDesktop="0px" paddingMobile="0px">
        <SizedBox height={40} />
        <GrayCard>
          <RangeChart assetsWithLeverage={vm.assetsWithLeverage} size={180} />
        </GrayCard>

        <SizedBox height={12} />

        <Legend>
          {vm.rangeAssets.map(({ asset }, index) => (
            <Row key={index + "summary-card"} justifyContent="center" alignItems="center" mainAxisSize="fit-content">
              <RoundTokenIcon src={asset.logo} />
              <SizedBox width={4} />
              <Text size="small" type="primary" weight={500} fitContent>
                {asset.symbol}
              </Text>
            </Row>
          ))}
        </Legend>

        <SizedBox height={16} />
        <Divider />
        <SizedBox height={14} />
        <Text type="secondary" fitContent>
          Max to provide
        </Text>
        <Row justifyContent="center">
          <Text weight={500} fitContent>
            {vm.maxToProvide.toSmallFormat()}
            {` ${vm.rangeAssets[0].asset.symbol}`}
          </Text>
          <SizedBox width={4} />
          <Text weight={500} type="secondary" fitContent>
            {`≈ $ ${vm.maxToProvideUsd?.toBigFormat(2) ?? "0.00"}`}
          </Text>
        </Row>
        <SizedBox height={14} />
      </Card>
      {showLowRangeLiquidityNotification && <LowRangeLiquidityNotification />}
    </Root>
  );
};
export default observer(SummaryCard);
