import styled from "@emotion/styled";
import Card from "@components/Card";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import TextButton from "@components/TextButton";
import { useDcaVM } from "@screens/Trade/DcaVM";
import SessionCard from "@screens/Trade/Trade/Dca/SessionCard";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React from "react";

const List = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
`;

const DcaSessions: React.FC = () => {
  const vm = useDcaVM();
  const { accountStore } = useStores();

  if (accountStore.address == null) return null;

  return (
    <Card paddingDesktop="16px 24px" paddingMobile="16px">
      <Row justifyContent="space-between" alignItems="center">
        <Text weight={500} fitContent nowrap>
          My DCA sessions
        </Text>
        {vm.finishedSessions.length > 0 && (
          <TextButton
            kind="secondary"
            onClick={() => vm.setShowFinishedSessions(!vm.showFinishedSessions)}
            style={{ width: "fit-content" }}
          >
            {vm.showFinishedSessions ? "Hide finished" : `Show finished (${vm.finishedSessions.length})`}
          </TextButton>
        )}
      </Row>
      <SizedBox height={16} />
      {vm.visibleSessions.length === 0 ? (
        <Text size="medium" type="secondary">
          {vm.syncing ? "Loading sessions…" : "You have no DCA sessions yet."}
        </Text>
      ) : (
        <List>
          {vm.visibleSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </List>
      )}
    </Card>
  );
};

export default observer(DcaSessions);
