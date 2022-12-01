import React from "react";
import { LOGIN_TYPE } from "@stores/AccountStore";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import SizedBox from "@components/SizedBox";
import { Anchor } from "@components/Anchor";
import Text from "@components/Text";
import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import LoginScreenHeader from "@screens/LoginScreen/LoginScreenHeader";
import email from "@src/assets/icons/email.svg";
import seed from "@src/assets/icons/seed.svg";
import keeper from "@src/assets/icons/keeper.svg";
import metamask from "@src/assets/icons/metamask.svg";
import ledger from "@src/assets/icons/ledger.svg";

import pic from "@src/assets/loginScreenPuzzleRender.svg";
import LoginType from "./LoginType";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  z-index: 10;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  @media (min-width: 480px) {
    padding: 16px 0;
  }
  @media (min-width: 1280px) {
    padding: 40px 0;
  }
`;

const Pic = styled.div`
  background: url(${pic}) center no-repeat #eeeeee;
  background-size: cover;
  min-width: 640px;
  height: 100vh;
  display: none;
  margin-top: -80px;
  z-index: 1;
  @media (min-width: 1280px) {
    display: flex;
  }
`;

const Layout = styled.div`
  display: flex;
  flex: 1;

  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10000;
  background-color: ${({ theme }) => theme.colors.white};
  @media (min-width: 1280px) {
    justify-content: center;
  }
`;

const Container = styled(Column)`
  width: 100%;
`;
const LoginScreen: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const handleLogin = (loginType: LOGIN_TYPE) => () =>
    accountStore
      .login(loginType)
      .then(() => accountStore.setLoginModalOpened(false));
  const isMetamaskInstalled = typeof window.ethereum !== "undefined";
  const loginTypes = [
    {
      title: "WX.Network Email",
      icon: email,
      type: LOGIN_TYPE.SIGNER_EMAIL,
      active: true,
    },
    {
      title: "Seed phrase",
      icon: seed,
      type: LOGIN_TYPE.SIGNER_SEED,
      active: true,
    },
    {
      title: "MetaMask",
      icon: metamask,
      type: LOGIN_TYPE.METAMASK,
      active: isMetamaskInstalled,
    },
    // {
    //   title: "Keeper Mobile",
    //   icon: keeper,
    //   type: LOGIN_TYPE.KEEPER_MOBILE,
    //   active: true,
    // },
    {
      title: "Keeper Wallet",
      icon: keeper,
      type: LOGIN_TYPE.KEEPER,
      active: accountStore.isWavesKeeperInstalled,
    },
    {
      title: "Ledger",
      icon: ledger,
      type: LOGIN_TYPE.LEDGER,
      active: true,
    },
  ];
  if (!accountStore.loginModalOpened) return null;
  return (
    <Layout>
      <LoginScreenHeader />
      <Row alignItems="center">
        <Pic />
        <Root>
          <Column
            justifyContent="center"
            alignItems="center"
            crossAxisSize="max"
            style={{ maxWidth: 360 }}
          >
            <Text size="large" textAlign="center" weight={500}>
              Connect wallet
            </Text>
            <SizedBox height={40} />
            <Container>
              {loginTypes.map((t) => (
                <LoginType
                  {...t}
                  key={t.type}
                  onClick={t.active ? handleLogin(t.type) : undefined}
                />
              ))}
            </Container>
          </Column>
          <SizedBox height={8} />
          <Text weight={500} size="medium" textAlign="center">
            <span> New to Waves blockchain?</span> <br />
            <Anchor
              style={{ color: "#269995" }}
              href="https://puzzle-lend.gitbook.io/guidebook/get-started-on-waves/create-wallet"
            >
              Learn more about wallets
            </Anchor>
          </Text>
          <SizedBox height={116} />
        </Root>
      </Row>
    </Layout>
  );
};
export default observer(LoginScreen);
