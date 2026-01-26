import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import centerEllipsis from "@src/utils/centerEllipsis";
import copy from "copy-to-clipboard";
import { useStores } from "@stores";

interface LeaderboardEntry {
  address: string;
  totalPoints: number;
  completedIdeas: number;
  totalPaid: number;
}

interface Props {
  data: LeaderboardEntry[];
  limit?: number;
  showCurrentUser?: boolean;
}

const TableWrapper = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 70px 80px 110px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.colors.primary50};
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 70px 80px;
  }

  @media (max-width: 500px) {
    grid-template-columns: 40px 1fr 70px;
    padding: 10px 16px;
  }
`;

const HeaderCell = styled(Text)<{ center?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary650};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: ${({ center }) => center ? "center" : "left"};
`;

const TableRow = styled.div<{ isCurrentUser?: boolean; rank: number }>`
  display: grid;
  grid-template-columns: 50px 1fr 70px 80px 110px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  align-items: center;
  background: ${({ isCurrentUser, rank }) =>
    isCurrentUser
      ? "linear-gradient(135deg, rgba(146, 117, 204, 0.1) 0%, rgba(112, 117, 233, 0.1) 100%)"
      : rank <= 3
        ? "rgba(255, 215, 0, 0.03)"
        : "transparent"};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ isCurrentUser }) =>
      isCurrentUser
        ? "linear-gradient(135deg, rgba(146, 117, 204, 0.15) 0%, rgba(112, 117, 233, 0.15) 100%)"
        : "rgba(0, 0, 0, 0.02)"};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 70px 80px;
    padding: 12px 16px;
  }

  @media (max-width: 500px) {
    grid-template-columns: 40px 1fr 70px;
    padding: 10px 16px;
  }
`;

const RankCell = styled.div<{ rank: number }>`
  padding-left: 5px;
  font-size: 15px;
  font-weight: 700;
  color: ${({ rank, theme }) =>
    rank === 1 ? "#FFD700" :
    rank === 2 ? "#C0C0C0" :
    rank === 3 ? "#CD7F32" :
    theme.colors.primary650};
`;

const AddressCell = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const AddressText = styled(Text)`
  width: auto;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary800};
  font-family: monospace;

  @media (max-width: 500px) {
    font-size: 12px;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary300};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #9275CC;
  }
`;

const ValueCell = styled(Text)<{ highlight?: boolean; center?: boolean }>`
  font-size: 14px;
  font-weight: ${({ highlight }) => highlight ? 600 : 500};
  color: ${({ highlight, theme }) => highlight ? "#7075E9" : theme.colors.primary800};
  text-align: ${({ center }) => center ? "center" : "left"};

  @media (max-width: 500px) {
    font-size: 12px;
  }
`;

const HideOnMobile = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const HideOnSmall = styled.span`
  @media (max-width: 500px) {
    display: none;
  }
`;

const YouBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  color: white;
  text-transform: uppercase;
  margin-left: 4px;
`;

const EmptyState = styled(Column)`
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyText = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M11.0833 5.25H6.41667C5.77233 5.25 5.25 5.77233 5.25 6.41667V11.0833C5.25 11.7277 5.77233 12.25 6.41667 12.25H11.0833C11.7277 12.25 12.25 11.7277 12.25 11.0833V6.41667C12.25 5.77233 11.7277 5.25 11.0833 5.25Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91667 8.75H2.33333C2.02391 8.75 1.72717 8.62708 1.50838 8.40829C1.28958 8.1895 1.16667 7.89275 1.16667 7.58333V2.91667C1.16667 2.60725 1.28958 2.3105 1.50838 2.09171C1.72717 1.87292 2.02391 1.75 2.33333 1.75H7C7.30942 1.75 7.60617 1.87292 7.82496 2.09171C8.04375 2.3105 8.16667 2.60725 8.16667 2.91667V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getMedal = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

const LeaderboardTable: React.FC<Props> = ({ data, limit, showCurrentUser = true }) => {
  const { accountStore, notificationStore } = useStores();

  const handleCopyAddress = (address: string) => {
    copy(address);
    notificationStore.notify("Address copied", { type: "success", title: "Copied!" });
  };

  const displayData = limit ? data.slice(0, limit) : data;

  if (displayData.length === 0) {
    return (
      <TableWrapper>
        <EmptyState>
          <EmptyText>No contributors yet</EmptyText>
        </EmptyState>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell>Rank</HeaderCell>
        <HeaderCell>Address</HeaderCell>
        <HideOnSmall><HeaderCell center>Ideas</HeaderCell></HideOnSmall>
        <HeaderCell>Points</HeaderCell>
        <HideOnMobile><HeaderCell>Rewards</HeaderCell></HideOnMobile>
      </TableHeader>
      {displayData.map((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = showCurrentUser && accountStore.address?.toLowerCase() === entry.address.toLowerCase();

        return (
          <TableRow key={entry.address} isCurrentUser={isCurrentUser} rank={rank}>
            <RankCell rank={rank}>{getMedal(rank)}</RankCell>
            <AddressCell>
              <AddressText>{centerEllipsis(entry.address, 6)}</AddressText>
              <CopyButton onClick={() => handleCopyAddress(entry.address)} title="Copy address">
                <CopyIcon />
              </CopyButton>
              {isCurrentUser && <YouBadge>You</YouBadge>}
            </AddressCell>
            <HideOnSmall><ValueCell center>{entry.completedIdeas || 0}</ValueCell></HideOnSmall>
            <ValueCell style={{paddingLeft: 15}} highlight>{entry.totalPoints || 0}</ValueCell>
            <HideOnMobile><ValueCell>{entry.totalPaid?.toLocaleString() || 0} PUZZLE</ValueCell></HideOnMobile>
          </TableRow>
        );
      })}
    </TableWrapper>
  );
};

export default observer(LeaderboardTable);
