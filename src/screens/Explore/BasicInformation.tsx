import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import PuzzlePriceChart from "@screens/Explore/PuzzlePriceChart";
import TokenInformation from "@screens/Explore/TokenInformation";

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
      margin-right: 40px;
    }
  }
`;

const BasicInformation = () => {
  return (
    <Root>
      <PuzzlePriceChart />
      <TokenInformation />
    </Root>
  );
};

export default BasicInformation;
