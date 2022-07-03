import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import ExploreTokenPriceChart from "@screens/ExploreToken/ExploreTokenPriceChart";
import ExploreTokenPriceStatistics from "@screens/ExploreToken/ExploreTokenPriceStatistics";
import TradeWithTokens from "@screens/ExploreToken/TradeWithTokens";
import useWindowSize from "@src/hooks/useWindowSize";
import AboutToken from "@screens/ExploreToken/AboutToken";
import PoolsWithToken from "./PoolsWithToken";
import OperationsTable from "@screens/ExploreToken/OperationsTable";

const Root = styled(Column)`
  width: 100%;

  & > :first-of-type {
    margin-bottom: 24px;
  }

  @media (min-width: 880px) {
    flex-direction: row;
    //align-items: flex-end;
    & > :first-of-type {
      margin-bottom: 0;
      margin-right: 24px;
    }
  }
`;

const ExploreTokenBasicInformation = () => {
  const { width } = useWindowSize();
  return (
    <Root>
      <Column crossAxisSize="max">
        <ExploreTokenPriceChart />
        {width && width >= 880 && <AboutToken />}
        <PoolsWithToken />
        <OperationsTable />
      </Column>
      <Column crossAxisSize="max">
        <ExploreTokenPriceStatistics />
        <TradeWithTokens />
        {width && width < 880 && <AboutToken />}
      </Column>
    </Root>
  );
};
export default ExploreTokenBasicInformation;
