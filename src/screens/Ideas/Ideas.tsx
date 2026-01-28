import React, { useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Column, Row } from "@components/Flex";
import { useStores } from "@stores";
import Text from "@components/Text";
import Button from "@components/Button";
import IdeaCard from "./IdeaCard";
import SubmitIdeaModal from "./SubmitIdeaModal";
import StatsCard from "./StatsCard";
import AdminPanel from "./AdminPanel";
import LeaderboardTable from "@screens/Leaderboard/LeaderboardTable";
import { IDEA_STATUS, ROUTES } from "@src/constants";

const Root = styled(Column)`
  width: 100%;
  max-width: 1200px;
  padding: 48px 24px;
  box-sizing: border-box;
  align-items: flex-start;
  gap: 32px;
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 24px 16px;
    gap: 24px;
  }
`;

const HeaderSection = styled(Column)`
  width: 100%;
  gap: 20px;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }

  @media (max-width: 639px) {
    gap: 16px;
  }
`;

const TitleBlock = styled(Column)`
  gap: 12px;
  max-width: 700px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Title = styled(Text)`
  font-size: 40px;
  font-weight: 700;
  line-height: 48px;
  color: ${({ theme }) => theme.colors.primary800};
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 24px;
    line-height: 30px;
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

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  border-radius: 14px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  border: none;
  box-shadow: 0 4px 16px rgba(146, 117, 204, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(146, 117, 204, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 14px 24px;
    font-size: 15px;
    border-radius: 12px;
  }
`;

const StatsRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  box-sizing: border-box;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const LeaderboardSection = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  overflow: hidden;
`;

const LeaderboardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};

  @media (max-width: 500px) {
    padding: 12px 16px;
  }
`;

const LeaderboardTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
`;

const ViewAllWrapper = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: center;
  width: 100%;

  @media (max-width: 500px) {
    padding: 12px 16px;
  }
`;

const ViewAllButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const IdeasSection = styled(Column)`
  width: 100%;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const IdeasHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;

  @media (max-width: 500px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const TitleRow = styled(Row)`
  align-items: center;
  gap: 12px;
`;

const IdeasTitle = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const IdeasCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary650};
  background: ${({ theme }) => theme.colors.primary100};
  padding: 4px 12px;
  border-radius: 20px;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 3px 10px;
  }
`;

const TabsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  background: ${({ theme }) => theme.colors.primary100};
  padding: 4px;
  border-radius: 12px;
  flex-shrink: 0;
  width: fit-content;
  box-sizing: border-box;

  @media (max-width: 500px) {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: ${({ active, theme }) =>
    active ? theme.colors.white : "transparent"};
  color: ${({ active, theme }) =>
    active ? "#9275CC" : theme.colors.primary650};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) =>
    active ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none"};
  white-space: nowrap;
  box-sizing: border-box;

  &:hover {
    color: ${({ active }) => (active ? "#9275CC" : "#8265BC")};
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }

  @media (max-width: 500px) {
    flex: 1;
  }
`;

const IdeasList = styled(Column)`
  width: 100%;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const EmptyState = styled(Column)`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 80px 0px;
  text-align: center;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  border: 2px dashed ${({ theme }) => theme.colors.primary200};

  @media (max-width: 768px) {
    padding: 48px 16px;
    border-radius: 12px;
  }
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #9275CC20 0%, #7075E920 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    margin-bottom: 16px;
  }
`;

const EmptyText = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary800};
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const EmptySubtext = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }
`;

const LoadingContainer = styled(Column)`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
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

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const LoadingText = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
  margin-top: 16px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${({ active }) => (active ? "#9275CC" : "rgba(0,0,0,0.1)")};
  background: ${({ active }) => (active ? "#9275CC" : "transparent")};
  color: ${({ active, theme }) => (active ? "white" : theme.colors.primary650)};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #9275CC;
    color: ${({ active }) => (active ? "white" : "#9275CC")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

type TabType = "all" | "my" | "admin";
type StatusFilter = "all" | "open" | "in_progress" | "completed";
const ITEMS_PER_PAGE = 10;

interface TabConfig {
  id: string;
  label: string;
  tab: TabType;
  filter?: StatusFilter;
  condition?: () => boolean;
  style?: React.CSSProperties;
}

const LightbulbIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path
      d="M20 5C14.4772 5 10 9.47715 10 15C10 18.3137 11.6667 21.2311 14.1667 23.0556V26.6667C14.1667 27.5871 14.9129 28.3333 15.8333 28.3333H24.1667C25.0871 28.3333 25.8333 27.5871 25.8333 26.6667V23.0556C28.3333 21.2311 30 18.3137 30 15C30 9.47715 25.5228 5 20 5Z"
      stroke="#9275CC"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8333 33.3333H24.1667"
      stroke="#9275CC"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.6667 28.3333V33.3333"
      stroke="#9275CC"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23.3333 28.3333V33.3333"
      stroke="#9275CC"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Ideas: React.FC = () => {
  const { ideasStore, accountStore } = useStores();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<TabType>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("open");
  const [currentPage, setCurrentPage] = React.useState(1);

  useEffect(() => {
    document.title = "Puzzle Swap | Ideas";
    ideasStore.fetchIdeas();
    ideasStore.fetchGlobalStats();
    ideasStore.fetchLeaderboard();
  }, [ideasStore]);

  useEffect(() => {
    if (accountStore.address) {
      ideasStore.fetchMyIdeas();
      ideasStore.checkAdminStatus();
      ideasStore.fetchDevelopers();
    }
  }, [accountStore.address, ideasStore]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter]);

  const baseIdeas = activeTab === "all" ? ideasStore.ideas : ideasStore.myIdeas;

  // Apply status filter
  const filteredIdeas = baseIdeas.filter((idea) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return idea.status === IDEA_STATUS.DONE;
    if (statusFilter === "in_progress") return idea.status === IDEA_STATUS.IN_PROGRESS;
    if (statusFilter === "open") return idea.status !== IDEA_STATUS.DONE && idea.status !== IDEA_STATUS.REJECTED;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredIdeas.length / ITEMS_PER_PAGE);
  const paginatedIdeas = filteredIdeas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const globalStats = ideasStore.globalStats;
  const myRank = ideasStore.myRank;

  const tabs: TabConfig[] = useMemo(() => [
    { id: "open", label: "Open", tab: "all", filter: "open" },
    { id: "all", label: "All", tab: "all", filter: "all" },
    { id: "in_progress", label: "In Progress", tab: "all", filter: "in_progress" },
    { id: "completed", label: "Completed", tab: "all", filter: "completed" },
    { id: "my", label: "My Ideas", tab: "my", filter: "all", condition: () => !!accountStore.address },
    { id: "admin", label: "Admin", tab: "admin", condition: () => ideasStore.isAdmin, style: { marginLeft: 'auto' } },
  ], [accountStore.address, ideasStore.isAdmin]);

  const handleTabClick = (tab: TabType, filter?: StatusFilter) => {
    setActiveTab(tab);
    if (filter) setStatusFilter(filter);
  };

  const isTabActive = (tabConfig: TabConfig) => {
    if (tabConfig.tab === "admin" || tabConfig.tab === "my") {
      return activeTab === tabConfig.tab;
    }
    return activeTab === "all" && statusFilter === tabConfig.filter;
  };

  const handleSubmitClick = () => {
    if (!accountStore.address) {
      accountStore.setLoginModalOpened(true);
      return;
    }
    ideasStore.setSubmitModalOpen(true);
  };

  return (
    <Root>
      <HeaderSection>
        <TitleBlock>
          <Title>Community Driven Development</Title>
          <Subtitle>
            We actively develop community suggestions. Browse, propose, evaluate
            ideas and help us become better. Share your vision and earn rewards!
          </Subtitle>
        </TitleBlock>
        <SubmitButton onClick={handleSubmitClick}>Submit Idea</SubmitButton>
      </HeaderSection>

      {ideasStore.leaderboard.length > 0 && (
        <LeaderboardSection>
          <LeaderboardHeader>
            <LeaderboardTitle>Top Contributors</LeaderboardTitle>
          </LeaderboardHeader>
          <LeaderboardTable data={ideasStore.leaderboard} limit={3} />
          <ViewAllWrapper>
            <ViewAllButton onClick={() => navigate(ROUTES.LEADERBOARD)}>
              View All
            </ViewAllButton>
          </ViewAllWrapper>
        </LeaderboardSection>
      )}

      <StatsRow>
        <StatsCard
          title="Completed Ideas"
          value={(globalStats?.completedIdeas || 0).toString()}
          subtitle={`of ${globalStats?.totalIdeas || 0} total`}
        />
        <StatsCard
          title="Total Paid"
          value={`${(globalStats?.totalPaid || 0).toLocaleString()} PUZZLE`}
          subtitle="for all completed ideas"
        />
      </StatsRow>

      <IdeasSection>
        <IdeasHeader>
          <TitleRow>
            <IdeasTitle>{activeTab === "admin" ? "User Management" : "Ideas"}</IdeasTitle>
            {activeTab !== "admin" && <IdeasCount>{filteredIdeas.length}</IdeasCount>}
          </TitleRow>
          <TabsRow>
            {tabs
              .filter(t => !t.condition || t.condition())
              .map(t => (
                <Tab
                  key={t.id}
                  active={isTabActive(t)}
                  onClick={() => handleTabClick(t.tab, t.filter)}
                  style={t.style}
                >
                  {t.label}
                </Tab>
              ))}
          </TabsRow>
        </IdeasHeader>

        {activeTab === "admin" ? (
          <AdminPanel />
        ) : ideasStore.loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading ideas...</LoadingText>
          </LoadingContainer>
        ) : filteredIdeas.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <LightbulbIcon />
            </EmptyIcon>
            <EmptyText>
              {activeTab === "my"
                ? "You haven't submitted any ideas yet"
                : statusFilter === "completed"
                ? "No completed ideas yet"
                : statusFilter === "in_progress"
                ? "No ideas in progress"
                : statusFilter === "open"
                ? "No open ideas"
                : "No ideas submitted yet"}
            </EmptyText>
            <EmptySubtext>
              {activeTab === "my"
                ? "Share your first idea and help improve the platform"
                : statusFilter === "completed"
                ? "Completed ideas will appear here"
                : statusFilter === "in_progress"
                ? "Ideas being worked on will appear here"
                : "Be the first to share your idea with the community"}
            </EmptySubtext>
            {statusFilter !== "completed" && statusFilter !== "in_progress" && (
              <SubmitButton onClick={handleSubmitClick}>
                Submit Your Idea
              </SubmitButton>
            )}
          </EmptyState>
        ) : (
          <>
            <IdeasList>
              {paginatedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </IdeasList>
            {totalPages > 1 && (
              <Pagination>
                <PageButton
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ←
                </PageButton>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PageButton
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageButton>
                ))}
                <PageButton
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  →
                </PageButton>
              </Pagination>
            )}
          </>
        )}
      </IdeasSection>

      <SubmitIdeaModal
        visible={ideasStore.submitModalOpen}
        onClose={() => ideasStore.setSubmitModalOpen(false)}
      />
    </Root>
  );
};

export default observer(Ideas);
