import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import TokenInfo from "@screens/Explore/TokenInfo";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 880px) {
    flex-direction: row;
  }
`;
const Title = styled(Text)`
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
`;

const TopTokens: React.FC<IProps> = () => {
  const top = [
    {
      assetId: TOKENS_BY_SYMBOL.WAVES.assetId,
      change: 2.5,
    },
    {
      assetId: TOKENS_BY_SYMBOL.PUZZLE.assetId,
      change: 2.5,
    },
    {
      assetId: TOKENS_BY_SYMBOL.USDN.assetId,
      change: 2.5,
    },
  ];
  return (
    <Root>
      <Card>
        <Title>Biggest gainers</Title>
        {top.map(() => (
          <div></div>
          // <TokenInfo />
        ))}
      </Card>
      <Card>
        <Title>Biggest losers</Title>
      </Card>
    </Root>
  );
};
export default TopTokens;
