import Card from "@src/components/Card";
import SizedBox from "@src/components/SizedBox";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import { HTMLAttributes } from "react";

const RangeLiquidity: React.FC<HTMLAttributes<HTMLElement>> = (props) => {
  const vm = useRangeDetailsInterfaceVM();

  return (
    <Card paddingDesktop="16px 24px" paddingMobile="12px 16px" {...props}>
      <Text type="secondary" size="medium">
        Fact / Virtual Liquidity
      </Text>
      <SizedBox height={12} />
        <Text fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>
          ${
            vm.range!.liquidity.toFormat(2)
          } / <Text type="secondary" fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>
            ${vm.range!.virtualLiquidity.toFormat(2)}
          </Text>
        </Text>
    </Card>
  );
}

export default observer(RangeLiquidity);
