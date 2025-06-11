import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { useInvestToRangeInterfaceVM } from "./InvestToRangeInterfaceVM";
import Card from "@src/components/Card";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import Skeleton from "react-loading-skeleton";
import BN from "@src/utils/BN";
import { Row } from "@src/components/Flex";
import TokenTag from "./TokenTag";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Select from "@src/components/Select";

interface IProps {}

const Root = styled.div`
  display: grid;
  flex-direction: column;
  padding-top: 24px;
  column-gap: 8px;
  row-gap: 8px;
  grid-template-columns: repeat(2, 1fr);
  @media (min-width: 880px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CCard = styled(Card)`
  padding: 12px 16px;
  @media (min-width: 880px) {
    padding: 16px 24px;
  }
`;
const PoolInformation: React.FC<IProps> = () => {
  const vm = useInvestToRangeInterfaceVM();
  const data = vm.range!;
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
  ]

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

  const valuesArray = [
    {
      title: "Fact / Virtual Liquidity",
      value: data.liquidity && data.virtualLiquidity
        ? (
          <>
            <Text fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}>${new BN(data.liquidity).toFormat(2)} /</Text>
            <Text type="secondary" fitContent style={{ display: "inline", fontSize: "20px", lineHeight: "24px" }}> ${new BN(data.virtualLiquidity).toFormat(2)}</Text>
          </>
        )
        : null,
    },
    {
      title: (
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
      ),
      value: (
        <Row style={{ gap: "8px" }}>
          {vm.LPRewardsToDisplay.map((item, index) => (
            <TokenTag token={TOKENS_BY_ASSET_ID[item.assetId]} amount={new BN(item.amount)} key={index} />
          ))}  
        </Row>
      ),
    }
  ];
  return (
    <Root>
      {valuesArray.map(({ title, value }, index) => (
        <CCard key={index}>
          <Text type="secondary" size="medium">
            {title}
          </Text>
          <SizedBox height={12} />
          {value != null ? (
              <Text style={{ fontSize: "20px", lineHeight: "24px" }}>
                {value}
              </Text>
            ) : (
            <Skeleton height={24} />
          )}
        </CCard>
      ))}
    </Root>
  );
};
export default observer(PoolInformation);
