import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import { useStores } from "@stores";
import { IDEAS_API_URL, IDEA_STATUS } from "@src/constants";
import centerEllipsis from "@src/utils/centerEllipsis";

interface LeaderboardEntry {
  address: string;
  completedIdeas: number;
  totalIdeas: number;
  bonusPoints: number;
  totalPoints: number;
  totalPaid: number;
}

interface UserRole {
  address: string;
  role: "owner" | "admin" | "developer";
  nickname?: string;
  addedBy: string;
  addedAt: string;
}

const Panel = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 28px;
  gap: 24px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px 16px;
    gap: 20px;
    border-radius: 12px;
  }

  @media (max-width: 400px) {
    padding: 16px 12px;
    gap: 16px;
  }
`;

const PanelHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const HeaderLeft = styled(Row)`
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const Title = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Badge = styled.span<{ role: string }>`
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ role }) =>
    role === "owner" ? "linear-gradient(135deg, #9275CC20 0%, #7075E920 100%)" :
    role === "admin" ? "#7075E915" : "#35A15A15"};
  color: ${({ role }) =>
    role === "owner" ? "#9275CC" :
    role === "admin" ? "#7075E9" : "#35A15A"};
  border: 1px solid ${({ role }) =>
    role === "owner" ? "#9275CC30" :
    role === "admin" ? "#7075E930" : "#35A15A30"};

  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 10px;
  }
`;

const UserAvatar = styled.div<{ role: string }>`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: ${({ role }) =>
    role === "owner" ? "linear-gradient(135deg, #9275CC 0%, #7075E9 100%)" :
    role === "admin" ? "#7075E9" : "#35A15A"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 10px;
    font-size: 12px;
  }
`;

const UsersList = styled(Column)`
  width: 100%;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const UserCard = styled.div`
  width: 100%;
  padding: 18px 20px;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 14px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    border-radius: 12px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const UserInfo = styled(Row)`
  gap: 14px;
  align-items: center;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const UserDetails = styled(Column)`
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

const AddressRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Address = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
  font-family: monospace;
  word-break: break-all;
  overflow-wrap: anywhere;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const AddedInfo = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const ActionButton = styled.button<{ danger?: boolean; primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid ${({ danger, primary }) =>
    danger ? "#D6666230" :
    primary ? "#9275CC30" : "#8082C530"};
  background: ${({ danger, primary }) =>
    danger ? "#D6666210" :
    primary ? "#9275CC10" : "transparent"};
  color: ${({ danger, primary }) =>
    danger ? "#D66662" :
    primary ? "#9275CC" : "#8082C5"};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ danger, primary }) =>
      danger ? "#D6666220" :
      primary ? "#9275CC20" : "#8082C520"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }

  @media (max-width: 600px) {
    flex: 1;
    text-align: center;
  }
`;

const AddUserForm = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 14px;
  border: 2px dashed ${({ theme }) => theme.colors.primary200};
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 10px;
    border-radius: 12px;
  }

  @media (max-width: 400px) {
    padding: 12px;
  }
`;

const FormTitle = styled(Text)`
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
  border-radius: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.white};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #9275CC;
    box-shadow: 0 0 0 3px rgba(146, 117, 204, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary650};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
  }
`;

const SelectButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    gap: 10px;
  }

  @media (max-width: 400px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
  border-radius: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 130px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #9275CC;
    box-shadow: 0 0 0 3px rgba(146, 117, 204, 0.1);
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 14px;
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 400px) {
    width: 100%;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(146, 117, 204, 0.25);
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(146, 117, 204, 0.35);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 14px;
    flex: 1;
  }

  @media (max-width: 400px) {
    width: 100%;
  }
`;

const EmptyState = styled(Column)`
  width: 100%;
  align-items: center;
  padding: 32px 20px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const EmptyText = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const SectionTitle = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

// Leaderboard styled components
const LeaderboardTable = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LeaderboardHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 100px 80px 100px;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary650};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    grid-template-columns: 32px 1fr 70px 60px 80px;
    gap: 8px;
    padding: 10px 12px;
    font-size: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 28px 1fr 60px 50px;
    & > *:nth-of-type(4) {
      display: none;
    }
  }
`;

const LeaderboardRow = styled.div<{ clickable?: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr 100px 80px 100px;
  gap: 12px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 12px;
  align-items: center;
  transition: all 0.2s ease;
  cursor: ${({ clickable }) => clickable ? "pointer" : "default"};

  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }

  @media (max-width: 768px) {
    grid-template-columns: 32px 1fr 70px 60px 80px;
    gap: 8px;
    padding: 12px 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 28px 1fr 60px 50px;
    & > *:nth-of-type(4) {
      display: none;
    }
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  background: ${({ rank }) =>
    rank === 1 ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" :
    rank === 2 ? "linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)" :
    rank === 3 ? "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)" :
    "#E8E8E8"};
  color: ${({ rank }) => rank <= 3 ? "white" : "#666"};

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 11px;
  }
`;

const LeaderboardAddress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const AddressMain = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
  font-family: monospace;
  word-break: break-all;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const AddressSub = styled(Text)`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary650};

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const StatCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const StatValue = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const StatLabel = styled(Text)`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.primary650};

  @media (max-width: 768px) {
    font-size: 9px;
  }
`;

const Pagination = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

const EllipsisSpan = styled.span`
  color: ${({ theme }) => theme.colors.primary650};
  font-size: 14px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${({ active, theme }) => active ? "#9275CC" : theme.colors.primary200};
  background: ${({ active, theme }) => active ? "linear-gradient(135deg, #9275CC 0%, #7075E9 100%)" : theme.colors.white};
  color: ${({ active, theme }) => active ? "white" : theme.colors.primary650};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #9275CC;
    background: ${({ active, theme }) => active ? "linear-gradient(135deg, #9275CC 0%, #7075E9 100%)" : theme.colors.primary100};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UserIdeasModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 20px;
  padding: 28px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary650};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary200};
  }
`;

const IdeaListItem = styled.div`
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IdeaDescription = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
  line-height: 1.5;
`;

const IdeaStats = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const IdeaStat = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const signMessage = async (accountStore: any, message: string): Promise<{ signature: string; publicKey: string } | null> => {
  const keeper = (window as any).KeeperWallet || (window as any).WavesKeeper;
  if (keeper) {
    try {
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      const base64Message = btoa(String.fromCharCode.apply(null, Array.from(messageBytes)));

      const signResult = await keeper.signCustomData({
        version: 1,
        binary: "base64:" + base64Message
      });
      return { signature: signResult.signature, publicKey: signResult.publicKey };
    } catch (e) {
      return null;
    }
  } else if (accountStore.signer) {
    try {
      const signResult = await accountStore.signer.signMessage(message);
      const signature = (signResult as any)[0]?.signature || (signResult as any).signature || String(signResult);
      const publicKey = (signResult as any)[0]?.publicKey || (signResult as any).publicKey || "";
      return { signature, publicKey };
    } catch (e) {
      return null;
    }
  }
  return null;
};

const ITEMS_PER_PAGE = 10;

const AdminPanel: React.FC = () => {
  const { accountStore, notificationStore, ideasStore } = useStores();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "developer">("developer");
  const [userPermissions, setUserPermissions] = useState<{
    isOwner: boolean;
    isAdmin: boolean;
    canManageUsers: boolean;
  } | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [selectedUserAddress, setSelectedUserAddress] = useState<string | null>(null);
  const [selectedUserIdeas, setSelectedUserIdeas] = useState<any[]>([]);

  const fetchPermissions = async () => {
    if (!accountStore.address) return;

    try {
      const response = await fetch(
        `${IDEAS_API_URL}/whitelist/me/${accountStore.address}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchUsers = async () => {
    if (!accountStore.address) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${IDEAS_API_URL}/whitelist/users?address=${accountStore.address}`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchUserIdeas = async (address: string) => {
    try {
      const response = await fetch(`${IDEAS_API_URL}/ideas/user/${address}`);
      if (response.ok) {
        const data = await response.json();
        // Filter only completed ideas
        const completedIdeas = (data.ideas || []).filter(
          (idea: any) => idea.status === IDEA_STATUS.DONE
        );
        setSelectedUserIdeas(completedIdeas);
        setSelectedUserAddress(address);
      }
    } catch (error) {
      console.error("Error fetching user ideas:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [accountStore.address]);

  useEffect(() => {
    if (userPermissions?.canManageUsers) {
      fetchUsers();
      fetchLeaderboard();
    }
  }, [userPermissions]);

  const handleAddUser = async () => {
    if (!newAddress.trim()) {
      notificationStore.notify("Please enter an address", {
        type: "warning",
        title: "Error"
      });
      return;
    }

    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "add_user",
        address: accountStore.address,
        targetAddress: newAddress.trim(),
        timestamp
      });

      const signed = await signMessage(accountStore, message);
      if (!signed) {
        throw new Error("Failed to sign message. Please check your wallet.");
      }

      const response = await fetch(`${IDEAS_API_URL}/whitelist/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminAddress: accountStore.address,
          targetAddress: newAddress.trim(),
          role: newRole,
          nickname: newNickname.trim() || undefined,
          signature: signed.signature,
          publicKey: signed.publicKey,
          message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add user");
      }

      notificationStore.notify("User added successfully", {
        type: "success",
        title: "Success"
      });

      setNewAddress("");
      setNewNickname("");
      fetchUsers();
    } catch (error: any) {
      notificationStore.notify(error.message, {
        type: "danger",
        title: "Error"
      });
    }
  };

  const handleRemoveUser = async (address: string) => {
    if (!window.confirm(`Remove user ${centerEllipsis(address)}?`)) return;

    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "remove_user",
        address: accountStore.address,
        targetAddress: address,
        timestamp
      });

      const signed = await signMessage(accountStore, message);
      if (!signed) {
        throw new Error("Failed to sign message. Please check your wallet.");
      }

      const response = await fetch(
        `${IDEAS_API_URL}/whitelist/users/${address}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminAddress: accountStore.address,
            signature: signed.signature,
            publicKey: signed.publicKey,
            message
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove user");
      }

      notificationStore.notify("User removed", {
        type: "success",
        title: "Success"
      });

      fetchUsers();
    } catch (error: any) {
      notificationStore.notify(error.message, {
        type: "danger",
        title: "Error"
      });
    }
  };

  const handleChangeRole = async (address: string, role: "admin" | "developer") => {
    try {
      const timestamp = Date.now();
      const message = JSON.stringify({
        action: "update_user",
        address: accountStore.address,
        targetAddress: address,
        timestamp
      });

      const signed = await signMessage(accountStore, message);
      if (!signed) {
        throw new Error("Failed to sign message. Please check your wallet.");
      }

      const response = await fetch(
        `${IDEAS_API_URL}/whitelist/users/${address}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminAddress: accountStore.address,
            role,
            signature: signed.signature,
            publicKey: signed.publicKey,
            message
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      notificationStore.notify("Role updated", {
        type: "success",
        title: "Success"
      });

      fetchUsers();
    } catch (error: any) {
      notificationStore.notify(error.message, {
        type: "danger",
        title: "Error"
      });
    }
  };

  if (!userPermissions?.canManageUsers) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getInitials = (address: string) => {
    return address.slice(0, 2).toUpperCase();
  };

  // Pagination calculations
  const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
  const paginatedLeaderboard = leaderboard.slice(
    (leaderboardPage - 1) * ITEMS_PER_PAGE,
    leaderboardPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (leaderboardPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (leaderboardPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", leaderboardPage - 1, leaderboardPage, leaderboardPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const getDeveloperNickname = (address: string): string | null => {
    const dev = (ideasStore.allDevelopers || []).find(
      d => d.address.toLowerCase() === address.toLowerCase()
    );
    return dev?.nickname || null;
  };

  return (
    <Panel>
      <PanelHeader>
        <HeaderLeft>
          <Title>User Management</Title>
          <Badge role={userPermissions.isOwner ? "owner" : "admin"}>
            {userPermissions.isOwner ? "Owner" : "Admin"}
          </Badge>
        </HeaderLeft>
      </PanelHeader>

      <AddUserForm>
        <FormTitle>Add New User</FormTitle>
        <FormRow>
          <Input
            type="text"
            placeholder="Waves address (3P...)"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Nickname (optional)"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            style={{ maxWidth: 180 }}
          />
        </FormRow>
        <FormRow>
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as "admin" | "developer")}
          >
            <option value="developer">Developer</option>
            {userPermissions.isOwner && <option value="admin">Admin</option>}
          </Select>
          <AddButton onClick={handleAddUser}>Add User</AddButton>
        </FormRow>
      </AddUserForm>

      <Column style={{ gap: 12 }}>
        <SectionTitle>All Users ({users.length})</SectionTitle>
        <UsersList>
          {loading ? (
            <EmptyState>
              <EmptyText>Loading users...</EmptyText>
            </EmptyState>
          ) : users.length === 0 ? (
            <EmptyState>
              <EmptyText>No users added yet</EmptyText>
            </EmptyState>
          ) : (
            users.map((user) => (
              <UserCard key={user.address}>
                <UserInfo>
                  <UserAvatar role={user.role}>
                    {user.nickname ? user.nickname.slice(0, 2).toUpperCase() : getInitials(user.address)}
                  </UserAvatar>
                  <UserDetails>
                    <AddressRow>
                      {user.nickname && <Address style={{ fontFamily: 'inherit' }}>{user.nickname}</Address>}
                      <Address>{centerEllipsis(user.address)}</Address>
                      <Badge role={user.role}>{user.role}</Badge>
                    </AddressRow>
                    <AddedInfo>
                      Added by {centerEllipsis(user.addedBy)} • {formatDate(user.addedAt)}
                    </AddedInfo>
                  </UserDetails>
                </UserInfo>

                {user.role !== "owner" && (
                  <Actions>
                    {userPermissions.isOwner && user.role === "developer" && (
                      <ActionButton
                        primary
                        onClick={() => handleChangeRole(user.address, "admin")}
                      >
                        Make Admin
                      </ActionButton>
                    )}
                    {userPermissions.isOwner && user.role === "admin" && (
                      <ActionButton
                        onClick={() => handleChangeRole(user.address, "developer")}
                      >
                        Make Developer
                      </ActionButton>
                    )}
                    <ActionButton
                      danger
                      onClick={() => handleRemoveUser(user.address)}
                      disabled={user.role === "admin" && !userPermissions.isOwner}
                    >
                      Remove
                    </ActionButton>
                  </Actions>
                )}
              </UserCard>
            ))
          )}
        </UsersList>
      </Column>

      {/* Leaderboard Section */}
      <Column style={{ gap: 12, width: "100%" }}>
        <SectionTitle>Ideas Leaderboard ({leaderboard.length} contributors)</SectionTitle>
        {leaderboardLoading ? (
          <EmptyState>
            <EmptyText>Loading leaderboard...</EmptyText>
          </EmptyState>
        ) : leaderboard.length === 0 ? (
          <EmptyState>
            <EmptyText>No completed ideas yet</EmptyText>
          </EmptyState>
        ) : (
          <>
            <LeaderboardTable>
              <LeaderboardHeader>
                <span>#</span>
                <span>User</span>
                <span style={{ textAlign: "right" }}>Completed</span>
                <span style={{ textAlign: "right" }}>Points</span>
                <span style={{ textAlign: "right" }}>Paid</span>
              </LeaderboardHeader>
              {paginatedLeaderboard.map((entry, index) => {
                const rank = (leaderboardPage - 1) * ITEMS_PER_PAGE + index + 1;
                const nickname = getDeveloperNickname(entry.address);
                return (
                  <LeaderboardRow
                    key={entry.address}
                    clickable={entry.completedIdeas > 0}
                    onClick={() => entry.completedIdeas > 0 && fetchUserIdeas(entry.address)}
                  >
                    <RankBadge rank={rank}>{rank}</RankBadge>
                    <LeaderboardAddress>
                      <AddressMain>
                        {nickname || centerEllipsis(entry.address)}
                      </AddressMain>
                      {nickname && (
                        <AddressSub>{centerEllipsis(entry.address)}</AddressSub>
                      )}
                    </LeaderboardAddress>
                    <StatCell>
                      <StatValue>{entry.completedIdeas}</StatValue>
                      <StatLabel>of {entry.totalIdeas}</StatLabel>
                    </StatCell>
                    <StatCell>
                      <StatValue>{entry.totalPoints}</StatValue>
                      <StatLabel>pts</StatLabel>
                    </StatCell>
                    <StatCell>
                      <StatValue>{entry.totalPaid.toLocaleString()}</StatValue>
                      <StatLabel>PUZZLE</StatLabel>
                    </StatCell>
                  </LeaderboardRow>
                );
              })}
            </LeaderboardTable>

            {totalPages > 1 && (
              <Pagination>
                <PageButton
                  disabled={leaderboardPage === 1}
                  onClick={() => setLeaderboardPage(p => p - 1)}
                >
                  ←
                </PageButton>
                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <PageButton
                      key={index}
                      active={page === leaderboardPage}
                      onClick={() => setLeaderboardPage(page)}
                    >
                      {page}
                    </PageButton>
                  ) : (
                    <EllipsisSpan key={index}>{page}</EllipsisSpan>
                  )
                )}
                <PageButton
                  disabled={leaderboardPage === totalPages}
                  onClick={() => setLeaderboardPage(p => p + 1)}
                >
                  →
                </PageButton>
              </Pagination>
            )}
          </>
        )}
      </Column>

      {/* User Ideas Modal */}
      {selectedUserAddress && (
        <UserIdeasModal onClick={() => setSelectedUserAddress(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                Completed Ideas by {getDeveloperNickname(selectedUserAddress) || centerEllipsis(selectedUserAddress)}
              </ModalTitle>
              <CloseButton onClick={() => setSelectedUserAddress(null)}>×</CloseButton>
            </ModalHeader>
            {selectedUserIdeas.length === 0 ? (
              <EmptyState>
                <EmptyText>No completed ideas</EmptyText>
              </EmptyState>
            ) : (
              <Column style={{ gap: 12 }}>
                {selectedUserIdeas.map((idea) => (
                  <IdeaListItem key={idea.id}>
                    <IdeaDescription>
                      {idea.description.length > 200
                        ? idea.description.slice(0, 200) + "..."
                        : idea.description}
                    </IdeaDescription>
                    <IdeaStats>
                      <IdeaStat>
                        {idea.paidAmount ? `${idea.paidAmount.toLocaleString()} PUZZLE` : "No payment"}
                      </IdeaStat>
                      {idea.bonusPoints > 0 && (
                        <IdeaStat>+{idea.bonusPoints} bonus pts</IdeaStat>
                      )}
                      <IdeaStat>
                        {formatDate(idea.updatedAt || idea.createdAt)}
                      </IdeaStat>
                    </IdeaStats>
                  </IdeaListItem>
                ))}
              </Column>
            )}
          </ModalContent>
        </UserIdeasModal>
      )}
    </Panel>
  );
};

export default observer(AdminPanel);
