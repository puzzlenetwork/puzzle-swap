import { Row } from "@src/components/Flex";
import TokenTag from "@src/components/TokenTag";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import Card from "@src/components/Card";
import SizedBox from "@src/components/SizedBox";
import Text from "@src/components/Text";
import Select from "@src/components/Select";

const EarnedByLP = () => {
  const vm = useRangeDetailsInterfaceVM();

  const displayModes = [
    {
      key: "all",
      title: "All Rewards",
    },
    {
      key: "fees",
      title: "Earned Fees",
    },
    {
      key: "extra",
      title: "Extra Rewards",
    },
  ];

  const timeRanges = [
    {
      key: "1d",
      title: "Last Day",
    },
    {
      key: "7d",
      title: "Last Week",
    },
    {
      key: "1m",
      title: "Last Month",
    },
    {
      key: "3m",
      title: "Last 3 Months",
    },
    {
      key: "1y",
      title: "Last Year",
    },
    {
      key: "all",
      title: "All Time",
    },
  ]

  return (
    <Card paddingDesktop="16px 24px" paddingMobile="12px 16px">
      <Text type="secondary" size="medium">
      <Row alignItems="center">
        <Text type="secondary" size="medium">Earned by LP</Text>
        <Select
          kind="text"
          textSize="medium"
          options={displayModes}
          onSelect={({ key }) => {
            vm.setRewardsDisplayMode(key as ("all" | "fees" | "extra"));
          }}
          selected={displayModes.find((o) => o.key === vm.rewardsDisplayMode) || displayModes[0]}
        />
        <SizedBox width={20} />
        <Select
          kind="text"
          textSize="medium"
          options={timeRanges}
          onSelect={({ key }) => {
            vm.setTimeRangeToDisplayRewards(key as ("1d" | "7d" | "1m" | "3m" | "1y" | "all"));
          }}
          selected={timeRanges.find((o) => o.key === vm.timeRangeToDisplayRewards) || timeRanges[0]}
        />
      </Row>
      </Text>
      <SizedBox height={12} />
      <Row style={{ gap: "8px", flexWrap: "wrap" }}>
        {vm.LPRewardsToDisplay.map((item, index) => (
          <TokenTag token={{ ...TOKENS_BY_ASSET_ID[item.assetId], decimals: 0 }} amount={new BN(item.amount)} iconRight key={index} />
        ))}  
      </Row>
    </Card>
  )
}

export default observer(EarnedByLP);
