import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";
import Card from "@components/Card";
import ExploreTokenPriceChart from "@screens/ExploreToken/ExploreTokenPriceChart";

const Root = styled(Column)`
  width: 100%;
  & > :first-of-type {
    margin-bottom: 24px;
  }
  @media (min-width: 880px) {
    flex-direction: row;
    align-items: flex-end;

    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }
`;

const ExploreTokenBasicInformation = () => {
  return (
    <Root>
      <ExploreTokenPriceChart />
      <Card />
    </Root>
  );
};

export default ExploreTokenBasicInformation;
