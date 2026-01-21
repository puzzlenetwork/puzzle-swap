import React from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import Text from "@components/Text";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

const Card = styled(Column)`
  width: 100%;
  min-width: 0;
  height: 135px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  gap: 6px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  transition: all 0.2s ease;
  box-sizing: border-box;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary200};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }

  @media (max-width: 400px) {
    padding: 14px;
  }
`;

const Title = styled(Text)`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary650};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled(Text)`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary800};
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary650};
  word-break: break-word;

  @media (max-width: 400px) {
    font-size: 11px;
  }
`;

const ActionButton = styled.button`
  margin-top: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #9275CC 0%, #7075E9 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const StatsCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  actionText,
  onAction
}) => {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{value}</Value>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {actionText && onAction && (
        <ActionButton onClick={onAction}>{actionText}</ActionButton>
      )}
    </Card>
  );
};

export default StatsCard;
