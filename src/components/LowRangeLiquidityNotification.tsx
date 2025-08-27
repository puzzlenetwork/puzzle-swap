import Notification from "@components/Notification";
import { useTheme } from "@emotion/react";

const LowRangeLiquidityNotification = () => {
  const theme = useTheme();
  return (
    <Notification
      type="warning"
      title="Low Range Liquidity"
      text="All ranges with liquidity below $100 will not be indexed by the aggregator. However, you can still swap near these ranges using a direct link."
      style={{ marginTop: 24, border: `1px solid ${theme.colors.attention500}` }}
    />
  );
};

export default LowRangeLiquidityNotification;
