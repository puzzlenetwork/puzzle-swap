import Card from "@src/components/Card";
import SizedBox from "@src/components/SizedBox";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import { HTMLAttributes } from "react";
import { Column } from "@src/components/Flex";

const RangeLiquidity: React.FC<HTMLAttributes<HTMLElement>> = (props) => {
  const vm = useRangeDetailsInterfaceVM();

  return (
    <Card paddingDesktop="16px 24px" paddingMobile="12px 16px" {...props}>
      <Text type="secondary" size="medium">
        Fact / Virtual Liquidity
      </Text>
      <SizedBox height={12} />
      <Column>
        <Text fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>
          ${vm.range!.liquidity.toFormat(2)} /
        </Text>
        <Text type="secondary" fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>
          ${vm.range!.virtualLiquidity.toFormat(2)}
        </Text>
      </Column>
    </Card>
  );
};

export default observer(RangeLiquidity);
