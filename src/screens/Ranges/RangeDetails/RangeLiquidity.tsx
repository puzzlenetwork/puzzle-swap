import Card from "@src/components/Card";
import SizedBox from "@src/components/SizedBox";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import { HTMLAttributes } from "react";
import { Row } from "@src/components/Flex";
import styled from "@emotion/styled";
import Skeleton from "react-loading-skeleton";

const LiquidityText = styled(Text)`
  display: inline;
  font-size: 20px;
  line-height: 24px;
  white-space: nowrap;

  @media (max-width: 880px) {
    font-size: 14px;
    line-height: 18px;
  }
`;

const HeaderRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (max-width: 880px) {
    display: none;
  }
`;

const DesktopValuesRow = styled(Row)`
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;

  @media (max-width: 880px) {
    display: none;
  }
`;

const MobileContent = styled.div`
  display: none;

  @media (max-width: 880px) {
    display: block;
  }
`;

const MobileValuesRow = styled(Row)`
  flex-wrap: wrap;
  gap: 4px;
`;

const RangeLiquidity: React.FC<HTMLAttributes<HTMLElement>> = (props) => {
  const vm = useRangeDetailsInterfaceVM();

  return (
    <Card paddingDesktop="16px 24px" paddingMobile="12px 16px" {...props}>
      {/* Desktop */}
      <HeaderRow>
        <Text type="secondary" size="medium">
          Fact / Virtual Liquidity
        </Text>
        <Text type="secondary" size="medium" textAlign="end">
          APY
        </Text>
      </HeaderRow>
      <DesktopValuesRow style={{ marginTop: 12 }}>
        <Row style={{ gap: 4 }}>
          <LiquidityText fitContent>
            {vm.range ? `$${vm.range.liquidity.toFormat(2)} /` : <Skeleton width={120} height={24} />}
          </LiquidityText>
          <LiquidityText type="secondary" fitContent>
            {vm.range ? `$${vm.range.virtualLiquidity.toFormat(2)}` : <Skeleton width={120} height={24} />}
          </LiquidityText>
        </Row>
        <LiquidityText fitContent>
          {vm.range ? `${vm.currentApr.toFormat(2)}%` : <Skeleton width={80} height={24} />}
        </LiquidityText>
      </DesktopValuesRow>

      {/* Mobile */}
      <MobileContent>
        <Text type="secondary" size="medium">
          Fact / Virtual / APY
        </Text>
        <SizedBox height={12} />
        <MobileValuesRow>
          <LiquidityText fitContent>
            {vm.range ? `$${vm.range.liquidity.toFormat(2)} / $${vm.range.virtualLiquidity.toFormat(2)} / ${vm.currentApr.toFormat(2)}%` : <Skeleton width={200} height={18} />}
          </LiquidityText>
        </MobileValuesRow>
      </MobileContent>
    </Card>
  );
};

export default observer(RangeLiquidity);
