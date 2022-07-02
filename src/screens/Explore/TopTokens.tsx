import styled from "@emotion/styled";
import React from "react";
import Card from "@components/Card";
import Text from "@components/Text";
import TokenInfo from "@screens/Explore/TokenInfo";
import { observer } from "mobx-react-lite";
import { useExploreVM } from "@screens/Explore/ExploreVm";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (min-width: 880px) {
    flex-direction: row;
  }
`;
const Title = styled(Text)`
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
`;
const TokensContainer = styled.div`
  & > * {
    margin-top: 16px;
  }
`;

const TopTokens: React.FC<IProps> = () => {
  const vm = useExploreVM();
  return (
    <Root>
      <Card bordered>
        <Title>Biggest gainers</Title>
        <TokensContainer>
          {vm.top3Gainers.map((v, index) => (
            <TokenInfo
              key={v.assetId}
              num={index + 1}
              assetId={v.assetId}
              change={v.change24H}
            />
          ))}
        </TokensContainer>
      </Card>
      <Card bordered>
        <Title>Biggest losers</Title>
        <TokensContainer>
          {vm.top3Losers.map((v, index) => (
            <TokenInfo
              key={v.assetId}
              num={index + 1}
              assetId={v.assetId}
              change={v.change24H}
            />
          ))}
        </TokensContainer>
      </Card>
    </Root>
  );
};
export default observer(TopTokens);
