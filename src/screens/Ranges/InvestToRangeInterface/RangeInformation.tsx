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
      title: "Earned by LP",
      value: data.extraEarned
        ? (
          <Row style={{ gap: "8px" }}>
            {data.assets.filter(({ fees_earned, extra_earned }) => new BN(fees_earned + extra_earned).gt(0)).map((item, index) => (
              <TokenTag token={TOKENS_BY_ASSET_ID[item.asset_id]} amount={new BN(item.fees_earned + item.extra_earned)} key={index} />
            ))}  
          </Row>
        )
        : null,
    }
  ];
  return (
    <Root>
      {valuesArray.map(({ title, value }, index) => (
        <CCard key={index}>
          <Text type="secondary" size="medium">
            {title}
          </Text>
          <SizedBox height={4} />
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
