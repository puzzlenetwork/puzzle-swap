import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import Button from "@components/Button";
import LoggedInAccountInfo from "@components/Wallet/LoggedInAccountInfo";

interface IProps {}

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Wallet: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { address } = accountStore;

  return (
    <Root>
      {address == null ? (
        <Button
          size="medium"
          onClick={() => accountStore.setLoginModalOpened(true)}
          fixed
        >
          Connect wallet
        </Button>
      ) : (
        <LoggedInAccountInfo />
      )}
    </Root>
  );
};
export default observer(Wallet);
