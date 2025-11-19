import Card from "@src/components/Card";
import SizedBox from "@src/components/SizedBox";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import { HTMLAttributes } from "react";
import { Column, Row } from "@src/components/Flex";
import styled from "@emotion/styled";
import Skeleton from "react-loading-skeleton";

const AdaptiveFlex = styled(Column)`
  width: 100%;
  justify-content: space-between;
  @media (min-width: 880px) {
    flex-direction: row;
  }
`;

const HeaderRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const RangeLiquidity: React.FC<HTMLAttributes<HTMLElement>> = (props) => {
  const vm = useRangeDetailsInterfaceVM();

  return (
    <Card paddingDesktop="16px 24px" paddingMobile="12px 16px" {...props}>
      <HeaderRow>
        <Text type="secondary" size="medium">
          Fact / Virtual Liquidity
        </Text>
        <Text type="secondary" size="medium" textAlign="end">
          APY
        </Text>
      </HeaderRow>
      <SizedBox height={12} />
      <AdaptiveFlex>
        <Column>
          <AdaptiveFlex>
            <Text fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>
              {vm.range ? `$${vm.range.liquidity.toFormat(2)} /` : <Skeleton width={120} height={24} />}
            </Text>
            <SizedBox width={4} />
            <Text type="secondary" fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>
              {vm.range ? `$${vm.range.virtualLiquidity.toFormat(2)}` : <Skeleton width={120} height={24} />}
            </Text>
          </AdaptiveFlex>
        </Column>
        <SizedBox width={20} />
        <Column alignItems="flex-end" justifyContent="flex-end">
          <Text fitContent style={{ fontSize: "20px", lineHeight: "24px" }}>
            {vm.range ? `${vm.range.periodStats.apr.toFormat(2)}%` : <Skeleton width={80} height={24} />}
          </Text>
        </Column>
      </AdaptiveFlex>
    </Card>
  );
};

export default observer(RangeLiquidity);
