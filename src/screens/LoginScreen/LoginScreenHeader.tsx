import React from "react";
import styled from "@emotion/styled";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import Button from "@components/Button";
import { useStores } from "@stores";
import { themes } from "@src/themes/ThemeProvider";
import useWindowSize from "@src/hooks/useWindowSize";
import { useTheme } from "@emotion/react";

interface IProps {}

const Root = styled.div`
  display: flex;
  box-sizing: border-box;
  padding: 40px 12px;
  height: 80px;
  z-index: 2;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.white};
  @media (min-width: 1280px) {
    padding: 16px 24px;
    border-bottom: 1px solid transparent;
    background: transparent;
  }
`;
const Logo = styled.img`
  height: 40px;
`;
const CloseButton = styled(Button)`
  width: 40px;
  padding: 0;
`;

const LoginScreenHeader: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { width } = useWindowSize();
  const theme = useTheme();
  return (
    <Root>
      <a href="/">
        <Logo
          src={
            width && width >= 1280
              ? themes.darkTheme.images.icons.logo
              : theme.images.icons.logo
          }
          alt="logo"
        />
      </a>
      <CloseButton
        size="medium"
        kind="secondary"
        onClick={() => accountStore.setLoginModalOpened(false)}
      >
        <CloseIcon />
      </CloseButton>
    </Root>
  );
};
export default LoginScreenHeader;
