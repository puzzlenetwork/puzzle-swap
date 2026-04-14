import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import copy from "copy-to-clipboard";
import * as identityImg from "identity-img";
import { IIdea, IDEA_STATUS } from "@src/constants";
import { useStores } from "@stores";
import centerEllipsis from "@src/utils/centerEllipsis";

interface Props {
  idea: IIdea;
}

const CompactCard = styled.div`
  width: 100%;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary200};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 10px;
  }
`;

const IdeaNumber = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary300};
  min-width: 28px;

  @media (max-width: 768px) {
    font-size: 12px;
    min-width: 24px;
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Address = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.primary300};
  font-size: 12px;
`;

const Description = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary650};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    gap: 6px;
  }
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ color }) => color}15;
  color: ${({ color }) => color};
  white-space: nowrap;

  @media (max-width: 600px) {
    padding: 3px 6px;
    font-size: 10px;
  }
`;

const VoteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CompactVoteButton = styled.button<{ active?: boolean; voteType: "like" | "dislike" }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: ${({ active, voteType }) =>
    active
      ? voteType === "like"
        ? "#35A15A15"
        : "#D6666215"
      : "transparent"};
  color: ${({ active, voteType, theme }) =>
    active
      ? voteType === "like"
        ? "#35A15A"
        : "#D66662"
      : theme.colors.primary650};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ voteType }) =>
      voteType === "like" ? "#35A15A15" : "#D6666215"};
    color: ${({ voteType }) =>
      voteType === "like" ? "#35A15A" : "#D66662"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 3px 6px;
    gap: 3px;
    font-size: 11px;
  }
`;

// Modal styles
const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${({ isOpen }) => (isOpen ? "scale(1)" : "scale(0.95)")};
  transition: all 0.2s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
`;

const ModalUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalAvatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
`;

const ModalUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ModalAddress = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CopyButton = styled.button<{ copied?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  background: transparent;
  color: ${({ copied, theme }) => copied ? "#35A15A" : theme.colors.primary300};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ copied }) => copied ? "#35A15A" : "#9275CC"};
  }
`;

const TelegramHandle = styled.a`
  font-size: 13px;
  color: #9275CC;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary650};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary200};
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const ModalDescription = styled.div`
  font-size: 15px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.primary800};
  white-space: pre-wrap;
  word-break: break-word;
  padding: 16px;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 12px;
  margin-bottom: 16px;
`;

const ScreenshotsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Screenshot = styled.img`
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.primary100};
  transition: all 0.2s ease;

  &:hover {
    border-color: #9275CC;
  }
`;

const AttachmentsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const AttachmentsLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary650};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AttachmentLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  font-size: 13px;
  color: #9275CC;
  text-decoration: none;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    border-color: #9275CC;
    background: #9275CC10;
  }

  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ImgurPreview = styled.img`
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.primary100};
  transition: all 0.2s ease;

  &:hover {
    border-color: #9275CC;
  }
`;

const getImgurDirectUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "imgur.com" && host !== "i.imgur.com") return null;

    if (host === "i.imgur.com") return url;

    const path = parsed.pathname.replace(/^\/+/, "");
    if (!path || path.startsWith("a/") || path.startsWith("gallery/") || path.startsWith("t/")) return null;

    const id = path.split("/")[0].replace(/\.[a-zA-Z0-9]+$/, "");
    if (!/^[a-zA-Z0-9]+$/.test(id)) return null;

    return `https://i.imgur.com/${id}.jpg`;
  } catch {
    return null;
  }
};

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  gap: 12px;
  flex-wrap: wrap;
`;

const ModalMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Timestamp = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary650};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ModalStatusBadge = styled.span<{ color: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ color }) => color}15;
  color: ${({ color }) => color};
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const VoteButton = styled.button<{ active?: boolean; voteType: "like" | "dislike" }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid ${({ active, voteType }) =>
    active
      ? voteType === "like"
        ? "#35A15A40"
        : "#D6666240"
      : "rgba(0, 0, 0, 0.1)"};
  background: ${({ active, voteType }) =>
    active
      ? voteType === "like"
        ? "#35A15A15"
        : "#D6666215"
      : "transparent"};
  color: ${({ active, voteType, theme }) =>
    active
      ? voteType === "like"
        ? "#35A15A"
        : "#D66662"
      : theme.colors.primary650};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ voteType }) =>
      voteType === "like" ? "#35A15A40" : "#D6666240"};
    background: ${({ voteType }) =>
      voteType === "like" ? "#35A15A10" : "#D6666210"};
    color: ${({ voteType }) =>
      voteType === "like" ? "#35A15A" : "#D66662"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AdminSection = styled.div`
  width: auto;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const DropdownContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 150px;
`;

const DropdownTrigger = styled.button<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid ${({ color }) => color}40;
  background: ${({ color }) => color}10;
  color: ${({ color }) => color};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: ${({ color }) => color}20;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  padding: 8px;
  z-index: 100;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transform: ${({ isOpen }) => (isOpen ? "translateY(0)" : "translateY(8px)")};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button<{ color: string; active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: ${({ active, color }) => (active ? `${color}15` : "transparent")};
  color: ${({ theme }) => theme.colors.primary800};
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;

  &:hover {
    background: ${({ color }) => color}15;
  }
`;

const StatusDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const DeleteButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #D6666230;
  background: #D6666210;
  color: #D66662;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #D6666220;
  }
`;

const BonusInputSection = styled.div`
  width: auto;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BonusLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary800};
`;

const BonusHint = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
`;

const BonusInputColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BonusButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const BonusInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
  border-radius: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.white};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #9275CC;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const ConfirmDoneButton = styled.button`
  flex: 2;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(146, 117, 204, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(146, 117, 204, 0.4);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.primary300};
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelDoneButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary200};
  }
`;

const AssigneeBadge = styled.span<{ hasAssignee?: boolean }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: ${({ hasAssignee }) => hasAssignee ? "#7075E915" : "#8082C510"};
  color: ${({ hasAssignee, theme }) => hasAssignee ? "#7075E9" : theme.colors.primary650};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 600px) {
    padding: 3px 6px;
    font-size: 10px;
  }
`;

const AssigneeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  margin-top: 12px;
`;

const AssigneeLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary650};
`;

const AssigneeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary200};
  border-radius: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary800};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  flex: 1;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: #7075E9;
  }
`;

const UserIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 6a3 3 0 100-6 3 3 0 000 6zm0 1.5c-2.003 0-6 1.005-6 3V12h12v-1.5c0-1.995-3.997-3-6-3z"/>
  </svg>
);

const ALL_STATUSES = [
  IDEA_STATUS.PENDING,
  IDEA_STATUS.IN_PROGRESS,
  IDEA_STATUS.NEEDS_INFO,
  IDEA_STATUS.TESTING,
  IDEA_STATUS.DONE,
  IDEA_STATUS.REJECTED
];

const ThumbUpIcon = ({ filled, size = 14 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDownIcon = ({ filled, size = 14 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M4.375 1.75V3.5M9.625 1.75V3.5M1.75 5.25H12.25M2.625 2.625H11.375C11.8582 2.625 12.25 3.01675 12.25 3.5V11.375C12.25 11.8582 11.8582 12.25 11.375 12.25H2.625C2.14175 12.25 1.75 11.8582 1.75 11.375V3.5C1.75 3.01675 2.14175 2.625 2.625 2.625Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TelegramIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.31.019.478z"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M11.0833 5.25H6.41667C5.77233 5.25 5.25 5.77233 5.25 6.41667V11.0833C5.25 11.7277 5.77233 12.25 6.41667 12.25H11.0833C11.7277 12.25 12.25 11.7277 12.25 11.0833V6.41667C12.25 5.77233 11.7277 5.25 11.0833 5.25Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91667 8.75H2.33333C2.02391 8.75 1.72717 8.62708 1.50838 8.40829C1.28958 8.1895 1.16667 7.89275 1.16667 7.58333V2.91667C1.16667 2.60725 1.28958 2.3105 1.50838 2.09171C1.72717 1.87292 2.02391 1.75 2.33333 1.75H7C7.30942 1.75 7.60617 1.87292 7.82496 2.09171C8.04375 2.3105 8.16667 2.60725 8.16667 2.91667V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DriveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8.01 19.03L3.01 10.98L7.99 3H16.01L21 10.98L16.02 19.03H8.01Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M3.01 10.98H20.99" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 3L16.02 19.03" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <path d="M4.5 7.5L7.5 4.5M5.25 3H3.75C2.92157 3 2.25 3.67157 2.25 4.5V8.25C2.25 9.07843 2.92157 9.75 3.75 9.75H7.5C8.32843 9.75 9 9.07843 9 8.25V6.75M7.5 2.25H9.75V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1.75 3.5H12.25M5.25 6.125V9.625M8.75 6.125V9.625M2.625 3.5L3.5 11.375C3.5 11.8723 3.90272 12.25 4.375 12.25H9.625C10.0973 12.25 10.5 11.8723 10.5 11.375L11.375 3.5M4.8125 3.5V2.1875C4.8125 1.94133 4.90986 1.70533 5.08319 1.53194C5.25652 1.35856 5.49252 1.26123 5.73863 1.26123H8.26137C8.50748 1.26123 8.74348 1.35856 8.91681 1.53194C9.09014 1.70533 9.1875 1.94133 9.1875 2.1875V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RewardSection = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(146, 117, 204, 0.1) 0%, rgba(112, 117, 233, 0.1) 100%);
  border-radius: 12px;
  margin-top: 12px;
`;

const RewardItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RewardLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary650};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RewardValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #7075E9;
`;

const IdeaCard: React.FC<Props> = ({ idea }) => {
  const { ideasStore, accountStore, notificationStore } = useStores();
  const isMyIdea = accountStore.address?.toLowerCase() === idea.address.toLowerCase();
  const isDeveloper = accountStore.address && (ideasStore.allDevelopers || []).some(
    d => d.address.toLowerCase() === accountStore.address!.toLowerCase()
  );
  const canSeeReward = isMyIdea || ideasStore.isAdmin || isDeveloper;
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showBonusInput, setShowBonusInput] = useState(false);
  const [bonusPoints, setBonusPoints] = useState<number | "">("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const avatar = identityImg.create(idea.address, { size: 32 * 3 });
  const modalAvatar = identityImg.create(idea.address, { size: 44 * 3 });

  const handleCopyAddress = () => {
    copy(idea.address);
    setCopiedAddress(true);
    notificationStore.notify("Address copied", { type: "success", title: "Copied!" });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyTelegram = () => {
    if (!idea.telegram) return;
    copy(`@${idea.telegram}`);
    setCopiedTelegram(true);
    notificationStore.notify("Telegram copied", { type: "success", title: "Copied!" });
    setTimeout(() => setCopiedTelegram(false), 2000);
  };

  const handleStatusChange = async (newStatus: IDEA_STATUS) => {
    if (updating || newStatus === idea.status) {
      setDropdownOpen(false);
      return;
    }

    // If setting to DONE, show bonus points input first
    if (newStatus === IDEA_STATUS.DONE) {
      setDropdownOpen(false);
      setShowBonusInput(true);
      return;
    }

    setUpdating(true);
    setDropdownOpen(false);
    await ideasStore.updateIdeaStatus(idea.id, newStatus);
    setUpdating(false);
  };

  const handleConfirmDone = async () => {
    const paid = paidAmount ? parseFloat(paidAmount) : 0;
    if (isNaN(paid) || paid < 0) {
      return;
    }
    const bonus = typeof bonusPoints === "number" ? bonusPoints : 0;
    setUpdating(true);
    setShowBonusInput(false);
    await ideasStore.updateIdeaStatus(idea.id, IDEA_STATUS.DONE, bonus, paid);
    setBonusPoints("");
    setPaidAmount("");
    setUpdating(false);
  };

  const handleCancelDone = () => {
    setShowBonusInput(false);
    setBonusPoints("");
    setPaidAmount("");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this idea? This cannot be undone.")) return;
    await ideasStore.deleteIdea(idea.id);
    setIsOpen(false);
  };

  const handleVote = async (e: React.MouseEvent, voteType: "like" | "dislike") => {
    e.stopPropagation();
    await ideasStore.voteIdea(idea.id, voteType);
  };

  const currentStatusColor = ideasStore.getStatusColor(idea.status);
  const userVote = ideasStore.getUserVote(idea);

  return (
    <>
      <CompactCard onClick={() => setIsOpen(true)}>
        {idea.number !== undefined && <IdeaNumber>#{idea.number}</IdeaNumber>}
        <Avatar src={avatar} alt="avatar" />
        <ContentWrapper>
          <TopRow>
            <Address>{centerEllipsis(idea.address)}</Address>
            <Separator>·</Separator>
            <Description>{idea.description}</Description>
          </TopRow>
        </ContentWrapper>
        <RightSection>
          {ideasStore.isAdmin && (
            <AssigneeBadge hasAssignee={!!idea.assignedTo}>
              <UserIcon />
              {idea.assignedTo ? ideasStore.getDeveloperName(idea.assignedTo) : "No assignee"}
            </AssigneeBadge>
          )}
          <VoteInfo>
            <CompactVoteButton
              voteType="like"
              active={userVote === "like"}
              disabled={ideasStore.votingIdeaId === idea.id}
              onClick={(e) => handleVote(e, "like")}
            >
              <ThumbUpIcon filled={userVote === "like"} size={12} />
              {idea.likes?.length || 0}
            </CompactVoteButton>
            <CompactVoteButton
              voteType="dislike"
              active={userVote === "dislike"}
              disabled={ideasStore.votingIdeaId === idea.id}
              onClick={(e) => handleVote(e, "dislike")}
            >
              <ThumbDownIcon filled={userVote === "dislike"} size={12} />
              {idea.dislikes?.length || 0}
            </CompactVoteButton>
          </VoteInfo>
          <StatusBadge color={currentStatusColor}>
            {ideasStore.getStatusLabel(idea.status)}
          </StatusBadge>
        </RightSection>
      </CompactCard>

      <Overlay isOpen={isOpen} onClick={() => setIsOpen(false)}>
        <Modal isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalUserInfo>
              <ModalAvatar src={modalAvatar} alt="avatar" />
              <ModalUserDetails>
                <AddressRow>
                  <ModalAddress>{centerEllipsis(idea.address)}</ModalAddress>
                  <CopyButton copied={copiedAddress} onClick={handleCopyAddress} title="Copy address">
                    {copiedAddress ? <CheckIcon /> : <CopyIcon />}
                  </CopyButton>
                </AddressRow>
                {idea.telegram && (
                  <AddressRow>
                    <TelegramHandle
                      href={`https://t.me/${idea.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TelegramIcon />
                      @{idea.telegram}
                    </TelegramHandle>
                    <CopyButton copied={copiedTelegram} onClick={handleCopyTelegram} title="Copy telegram">
                      {copiedTelegram ? <CheckIcon /> : <CopyIcon />}
                    </CopyButton>
                  </AddressRow>
                )}
              </ModalUserDetails>
            </ModalUserInfo>
            <CloseButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </CloseButton>
          </ModalHeader>

          <ModalContent>
            <ModalDescription>{idea.description}</ModalDescription>
            {idea.screenshots && idea.screenshots.length > 0 && (
              <ScreenshotsRow>
                {idea.screenshots.map((url, index) => (
                  <Screenshot
                    key={index}
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    onClick={() => window.open(url, "_blank")}
                  />
                ))}
              </ScreenshotsRow>
            )}
            {idea.attachments && idea.attachments.length > 0 && (
              <AttachmentsRow>
                <AttachmentsLabel>
                  <DriveIcon />
                  Attachments
                </AttachmentsLabel>
                {idea.attachments.map((url, index) => {
                  const imgurSrc = getImgurDirectUrl(url);
                  if (imgurSrc) {
                    return (
                      <ImgurPreview
                        key={index}
                        src={imgurSrc}
                        alt={`Attachment ${index + 1}`}
                        onClick={() => window.open(url, "_blank")}
                      />
                    );
                  }
                  const getShortName = (link: string) => {
                    try {
                      const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
                      if (match) return `Google Drive: ...${match[1].slice(-8)}`;
                      const docMatch = link.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
                      if (docMatch) return `Google Doc: ...${docMatch[1].slice(-8)}`;
                      return link.length > 50 ? link.slice(0, 47) + '...' : link;
                    } catch {
                      return link.length > 50 ? link.slice(0, 47) + '...' : link;
                    }
                  };
                  return (
                    <AttachmentLink
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <DriveIcon />
                      <span>{getShortName(url)}</span>
                      <LinkIcon />
                    </AttachmentLink>
                  );
                })}
              </AttachmentsRow>
            )}
            {ideasStore.isAdmin && (
              <AssigneeRow>
                <AssigneeLabel>Assignee:</AssigneeLabel>
                <AssigneeSelect
                  value={idea.assignedTo || ""}
                  onChange={(e) => ideasStore.assignDeveloper(idea.id, e.target.value || null)}
                >
                  <option value="">No assignee</option>
                  {(ideasStore.developers || []).map((dev) => (
                    <option key={dev.address} value={dev.address}>
                      {dev.nickname || dev.address.slice(0, 8) + "..."}
                    </option>
                  ))}
                </AssigneeSelect>
              </AssigneeRow>
            )}
          </ModalContent>

          {idea.status === IDEA_STATUS.DONE && canSeeReward && (idea.paidAmount || idea.bonusPoints) ? (
            <RewardSection>
              {idea.paidAmount ? (
                <RewardItem>
                  <RewardLabel>Reward</RewardLabel>
                  <RewardValue>{idea.paidAmount.toLocaleString("en-US")} PUZZLE</RewardValue>
                </RewardItem>
              ) : null}
              {idea.bonusPoints ? (
                <RewardItem>
                  <RewardLabel>Bonus</RewardLabel>
                  <RewardValue>+{idea.bonusPoints} pts</RewardValue>
                </RewardItem>
              ) : null}
            </RewardSection>
          ) : null}

          <ModalFooter>
            <ModalMeta>
              <Timestamp>
                <CalendarIcon />
                {formatDate(idea.createdAt)}
              </Timestamp>
              <ModalStatusBadge color={currentStatusColor}>
                {ideasStore.getStatusLabel(idea.status)}
              </ModalStatusBadge>
            </ModalMeta>
            <VoteButtons>
              <VoteButton
                voteType="like"
                active={userVote === "like"}
                disabled={ideasStore.votingIdeaId === idea.id}
                onClick={(e) => handleVote(e, "like")}
              >
                <ThumbUpIcon filled={userVote === "like"} />
                {idea.likes?.length || 0}
              </VoteButton>
              <VoteButton
                voteType="dislike"
                active={userVote === "dislike"}
                disabled={ideasStore.votingIdeaId === idea.id}
                onClick={(e) => handleVote(e, "dislike")}
              >
                <ThumbDownIcon filled={userVote === "dislike"} />
                {idea.dislikes?.length || 0}
              </VoteButton>
            </VoteButtons>
          </ModalFooter>

          {ideasStore.isAdmin && !showBonusInput && (
            <AdminSection>
              <DropdownContainer ref={dropdownRef}>
                <DropdownTrigger
                  color={currentStatusColor}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={updating}
                >
                  Change Status
                  <ChevronIcon />
                </DropdownTrigger>
                <DropdownMenu isOpen={dropdownOpen}>
                  {ALL_STATUSES.map((status) => (
                    <DropdownItem
                      key={status}
                      color={ideasStore.getStatusColor(status)}
                      active={idea.status === status}
                      onClick={() => handleStatusChange(status)}
                    >
                      <StatusDot color={ideasStore.getStatusColor(status)} />
                      {ideasStore.getStatusLabel(status)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </DropdownContainer>
              <DeleteButton onClick={handleDelete}>
                <TrashIcon />
                Delete
              </DeleteButton>
            </AdminSection>
          )}

          {showBonusInput && (
            <BonusInputSection>
              <BonusLabel>Complete Idea</BonusLabel>
              <BonusInputColumn>
                <BonusInput
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="PUZZLE amount"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
                <BonusInput
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Bonus points"
                  value={bonusPoints}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBonusPoints(val === "" ? "" : Math.max(0, parseInt(val) || 0));
                  }}
                />
              </BonusInputColumn>
              <BonusButtonRow>
                <CancelDoneButton onClick={handleCancelDone}>
                  Cancel
                </CancelDoneButton>
                <ConfirmDoneButton onClick={handleConfirmDone} disabled={updating}>
                  {updating ? "..." : "Complete"}
                </ConfirmDoneButton>
              </BonusButtonRow>
            </BonusInputSection>
          )}
        </Modal>
      </Overlay>
    </>
  );
};

export default observer(IdeaCard);
