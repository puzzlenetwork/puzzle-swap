import Notification from "@components/Notification";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Text from "@components/Text";
import { Column } from "./Flex";
import SizedBox from "./SizedBox";

interface Props {
  timeRemaining?: string | null;
  progress?: number | null;
}

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: ${({ theme }) => theme.colors.attention500};
  border-radius: 2px;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const RebalancingNotification: React.FC<Props> = ({ timeRemaining, progress }) => {
  const theme = useTheme();

  const content = (
    <Column mainAxisSize="stretch">
      <Text weight={500} size="medium">Rebalancing in Progress</Text>
      <SizedBox height={4} />
      <Text size="small">
        {timeRemaining
          ? `Estimated time remaining: ${timeRemaining}. Deposit and withdrawal operations are temporarily unavailable.`
          : "Deposit and withdrawal operations are temporarily unavailable."}
      </Text>
      {progress !== null && progress !== undefined && (
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
      )}
    </Column>
  );

  return (
    <Notification
      type="warning"
      text={content}
      style={{ marginTop: 24, border: `1px solid ${theme.colors.attention500}` }}
    />
  );
};

export default RebalancingNotification;
