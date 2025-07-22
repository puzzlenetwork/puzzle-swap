import React from "react";
import styled from "@emotion/styled";
import Card from "@components/Card";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useCreateRangeVM } from "./CreateRangeVm";
import { Row } from "@src/components/Flex";
import Divider from "@src/components/Divider";
import { Cell, Pie, PieChart } from "recharts";
import RangeChart from "@src/components/RangeChart";
import RoundTokenIcon from "@src/components/RoundTokenIcon";

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
  const data = vm.rangeAssets?.reduce<{ name: string; value: number }[]>(
    (acc, { asset, share }) => [
      ...acc,
      { name: asset.symbol, value: share.toNumber() },
    ],
    []
  );

  return (
    <Root>
      <Text type="secondary" weight={500}>
        Summary
      </Text>
      <SizedBox height={8} />
      <Card
        justifyContent="center"
        alignItems="center"
        paddingDesktop="0px"
        paddingMobile="0px"
      >
        <SizedBox height={40} />
        <GrayCard>
          <RangeChart
            assetsWithLeverage={vm.assetsWithLeverage}
            size={180}
          />
        </GrayCard>

        <SizedBox height={12} />

        <Legend>
          {vm.rangeAssets.map(({ asset }, index) => (
            <Row
              key={index + "summary-card"}
              justifyContent="center"
              alignItems="center"
              mainAxisSize="fit-content"
            >
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
        <Text weight={500} fitContent>
          {vm.maxToProvide.toFormat(2)}
          {` ${vm.rangeAssets[0].asset.symbol}`}
        </Text>
        <SizedBox height={14} />
      </Card>
    </Root>
  );
};
export default observer(SummaryCard);
