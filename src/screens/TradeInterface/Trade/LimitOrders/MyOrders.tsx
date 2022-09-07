import styled from "@emotion/styled";
import React, { useState } from "react";
import Tabs from "@components/Tabs";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { Column } from "@src/components/Flex";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const MyOrders: React.FC<IProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { accountStore } = useStores();
  return (
    <Root>
      <Text weight={500} style={{ fontSize: "24px", lineHeight: " 32px" }}>
        My orders
      </Text>
      <SizedBox height={24} />
      <Tabs
        tabs={[{ name: "Open" }, { name: "History" }]}
        activeTab={activeTab}
        setActive={(v) => setActiveTab(v)}
      />
      <SizedBox height={40} />
      {accountStore.address == null ? (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <Text fitContent>Connect your wallet to see your order history</Text>
          <SizedBox height={24} />
          <Button
            kind="secondary"
            size="medium"
            onClick={() => accountStore.setLoginModalOpened(true)}
          >
            Connect wallet
          </Button>
        </Column>
      ) : (
        <></>
      )}
    </Root>
  );
};
export default MyOrders;
