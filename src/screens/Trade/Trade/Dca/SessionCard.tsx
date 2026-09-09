import styled from "@emotion/styled";
import Button from "@components/Button";
import { Column, Row } from "@components/Flex";
import Progressbar from "@components/Progressbar";
import RoundTokenIcon from "@components/RoundTokenIcon";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import DcaSession from "@src/entities/DcaSession";
import { useDcaVM } from "@screens/Trade/DcaVM";
import centerEllipsis from "@src/utils/centerEllipsis";
import { observer } from "mobx-react-lite";
import React from "react";

interface IProps {
  session: DcaSession;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  background: ${({ theme }) => theme.colors.card.background};
`;

const Badge = styled.div<{ kind: "active" | "paused" | "completed" | "stopped" }>`
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  ${({ kind, theme }) => {
    switch (kind) {
      case "active":
        return `background: ${theme.colors.success100}; color: ${theme.colors.success550};`;
      case "paused":
        return `background: ${theme.colors.attention100}; color: ${theme.colors.attention550};`;
      case "completed":
        return `background: ${theme.colors.primary100}; color: ${theme.colors.primary650};`;
      default:
        return `background: ${theme.colors.error100}; color: ${theme.colors.error550};`;
    }
  }}
`;

const Actions = styled(Row)`
  gap: 8px;
  flex-wrap: wrap;
`;

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  stopped: "Stopped",
};

const SessionCard: React.FC<IProps> = ({ session }) => {
  const vm = useDcaVM();
  const tokenFrom = TOKENS_BY_ASSET_ID[session.fromAssetId];
  const tokenTo = TOKENS_BY_ASSET_ID[session.toAssetId];
  const decimalsFrom = tokenFrom?.decimals ?? 8;
  const decimalsTo = tokenTo?.decimals ?? 8;

  return (
    <Root>
      <Row justifyContent="space-between" alignItems="center">
        <Row alignItems="center" mainAxisSize="fit-content">
          <RoundTokenIcon src={tokenFrom?.logo} />
          <SizedBox width={4} />
          <RoundTokenIcon src={tokenTo?.logo} />
          <SizedBox width={8} />
          <Column>
            <Text weight={500} nowrap fitContent>
              {session.symbolFrom} ➔ {session.symbolTo}
            </Text>
            <Text size="small" type="secondary" nowrap fitContent title={session.id}>
              {centerEllipsis(session.id, 6)}
            </Text>
          </Column>
        </Row>
        <Badge kind={session.status}>{STATUS_LABEL[session.status]}</Badge>
      </Row>

      <SizedBox height={12} />
      <Progressbar percent={session.progress} />
      <SizedBox height={6} />
      <Row justifyContent="space-between">
        <Text size="small" type="secondary" fitContent nowrap>
          {session.completedSwaps} of {session.total} swaps
        </Text>
        <Text size="small" type="secondary" fitContent nowrap>
          {session.progress}%
        </Text>
      </Row>

      <SizedBox height={12} />
      <Row justifyContent="space-between">
        <Text size="small" type="secondary" fitContent nowrap>
          Accumulated
        </Text>
        <Text size="small" weight={500} fitContent nowrap>
          {session.formattedTotalReceived.toFormat(Math.min(6, decimalsTo))} {session.symbolTo}
        </Text>
      </Row>

      {session.active && (
        <>
          <Row justifyContent="space-between" style={{ marginTop: 4 }}>
            <Text size="small" type="secondary" fitContent nowrap>
              Left to spend
            </Text>
            <Text size="small" weight={500} fitContent nowrap>
              {session.formattedBalance.toFormat(Math.min(6, decimalsFrom))} {session.symbolFrom}
            </Text>
          </Row>
          <Row justifyContent="space-between" style={{ marginTop: 4 }}>
            <Text size="small" type="secondary" fitContent nowrap>
              Next swap
            </Text>
            <Text size="small" weight={500} fitContent nowrap>
              {session.paused
                ? "paused"
                : session.blocksUntilNext === 0
                ? "any moment"
                : `in ~${session.minutesUntilNext} min (${session.blocksUntilNext} blocks)`}
            </Text>
          </Row>
          <Row justifyContent="space-between" style={{ marginTop: 4 }}>
            <Text size="small" type="secondary" fitContent nowrap>
              Execution gas left
            </Text>
            <Text
              size="small"
              weight={500}
              fitContent
              nowrap
              type={session.isOutOfGas ? "error" : "primary"}
            >
              {session.formattedExecWaves.toFormat(3)} WAVES ({session.swapsCoveredByGas} swaps)
            </Text>
          </Row>
        </>
      )}

      {session.isOutOfGas && (
        <>
          <SizedBox height={8} />
          <Text size="small" type="error">
            Out of execution gas — stop the session to get the remaining tokens back.
          </Text>
        </>
      )}

      {session.active && (
        <>
          <SizedBox height={16} />
          <Actions>
            {session.paused ? (
              <Button
                kind="secondary"
                size="small"
                disabled={vm.loading || !session.resumable}
                onClick={() => vm.resume(session.id)}
              >
                Resume
              </Button>
            ) : (
              <Button kind="secondary" size="small" disabled={vm.loading} onClick={() => vm.pause(session.id)}>
                Pause
              </Button>
            )}
            <Button kind="danger" size="small" disabled={vm.loading} onClick={() => vm.stop(session.id)}>
              Stop & withdraw
            </Button>
          </Actions>
        </>
      )}
    </Root>
  );
};

export default observer(SessionCard);
