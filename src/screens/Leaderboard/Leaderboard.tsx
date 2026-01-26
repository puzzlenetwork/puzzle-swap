import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Column } from "@components/Flex";
import { useStores } from "@stores";
import Text from "@components/Text";
import LeaderboardTable from "./LeaderboardTable";

const Root = styled(Column)`
  width: 100%;
  max-width: 900px;
  padding: 48px 24px;
  box-sizing: border-box;
  align-items: flex-start;
  gap: 32px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 24px;
  }
`;

const HeaderSection = styled(Column)`
  width: 100%;
  gap: 12px;
`;

const Title = styled(Text)`
  font-size: 40px;
  font-weight: 700;
  line-height: 48px;
  color: ${({ theme }) => theme.colors.primary800};
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 28px;
    line-height: 34px;
  }
`;

const Subtitle = styled(Text)`
  font-size: 17px;
  line-height: 26px;
  color: ${({ theme }) => theme.colors.primary650};

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 20px;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  overflow: hidden;
`;

const LoadingContainer = styled(Column)`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid ${({ theme }) => theme.colors.primary100};
  border-top-color: #9275CC;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
  margin-top: 16px;
`;

const Leaderboard: React.FC = () => {
  const { ideasStore } = useStores();

  useEffect(() => {
    document.title = "Puzzle Swap | Leaderboard";
    ideasStore.fetchLeaderboard();
    ideasStore.fetchGlobalStats();
  }, [ideasStore]);

  return (
    <Root>
      <HeaderSection>
        <Title>Leaderboard</Title>
        <Subtitle>
          Top contributors who help improve the platform with their ideas.
          Submit your ideas and earn rewards!
        </Subtitle>
      </HeaderSection>

      <TableContainer>
        {ideasStore.leaderboardLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading leaderboard...</LoadingText>
          </LoadingContainer>
        ) : (
          <LeaderboardTable data={ideasStore.leaderboard} />
        )}
      </TableContainer>
    </Root>
  );
};

export default observer(Leaderboard);
