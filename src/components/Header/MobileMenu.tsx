import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Divider from "@components/Divider";
import Wallet from "@components/Wallet/Wallet";
import Scrollbar from "@components/Scrollbar";
import Text from "@components/Text";
import { Column } from "../Flex";
import { observer } from "mobx-react-lite";
import { ROUTES } from "@src/constants";
import DarkMode from "@components/Header/DarkMode";
import { Anchor } from "../Anchor";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import { useLocation } from "react-router-dom";
import { ReactComponent as MediumIcon } from "@src/assets/links/medium.svg";
import { ReactComponent as XIcon } from "@src/assets/links/x.svg";
import { ReactComponent as TelegramIcon } from "@src/assets/links/telegram.svg";
import { ReactComponent as RobotIcon } from "@src/assets/links/robot.svg";
import { THEME_TYPE } from "@src/themes/ThemeProvider";
import { useStores } from "@src/stores";

interface IProps {
  onClose: () => void;
  bannerClosed: boolean;
  opened: boolean;
}

const Root = styled.div<{ bannerClosed: boolean; opened: boolean }>`
  z-index: 100;
  position: absolute;
  // top: ${({ bannerClosed }) => (bannerClosed ? 64 : 144)}px;
  top: 64px;
  left: 0;
  right: 0;
  transition: 0.2s;
  overflow: hidden;

  ${({ opened }) => (!opened ? `height: 0px;` : "")}
  .menu-body {
    justify-content: space-between;
    height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.white};
  }
`;

const WalletWrapper = styled.div`
  padding: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
`;

const MenuItem = styled(Anchor) <{ selected?: boolean }>`
  display: flex;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  gap: 10px;
  color: ${({ theme }) => theme.colors.primary800};
  text-decoration: none;
  margin-bottom: 8px;
`;

const MenuContainer = styled(Column)`
  padding: 24px;
  width: 100%:
  margin: 24px;
  margin-bottom: 0px;
`;


const MobileMenu: React.FC<IProps> = ({ bannerClosed, opened, onClose }) => {
  const { accountStore } = useStores();
  const isDarkTheme = accountStore.selectedTheme === THEME_TYPE.DARK_THEME
  const mainFunctional = [
    { name: "Explore", link: ROUTES.EXPLORE, outer: false },
    { name: "Trade", link: ROUTES.TRADE, outer: false },
    { name: "Pools", link: ROUTES.POOLS, outer: false },
    { name: "Stake", link: ROUTES.STAKE, outer: false },
  ];

  const toolsMenu = [
    { name: "Notifications bot", link: "https://t.me/puzzle_swap", outer: true, icon: <RobotIcon className={isDarkTheme ? "theme_icon" : ""} /> },
    { name: "Alerts bot", link: "https://t.me/puzzle_alerts_bot", outer: true, icon: <RobotIcon className={isDarkTheme ? "theme_icon" : ""} /> },
  ];
  
  const communityMenu = [
    { name: "Telegram", link: "https://t.me/puzzle_network", outer: true, icon: <TelegramIcon className={isDarkTheme ? "theme_icon" : ""} /> },
    { name: "(X) Twitter", link: "https://twitter.com/puzzle_swap", outer: true, icon: <XIcon className={isDarkTheme ? "theme_icon" : ""} /> },
    { name: "Medium", link: "https://medium.com/@puzzlenetwork", outer: true, icon: <MediumIcon className={isDarkTheme ? "theme_icon" : ""} /> },
  ];

  const location = useLocation();

  return (
    <Root {...{ bannerClosed, opened }}>
      <div className="menu-body">
        <MenuContainer>
          <Column crossAxisSize="max">
            {mainFunctional.map(({ name, link }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                href={link}
                target={link[0] === "/" ? "_self" : ""}
              >
                {name}
              </MenuItem>
            ))}

            <SizedBox height={24} />

            <Text type="secondary" style={{marginBottom: 10}}>Tools</Text>
            {toolsMenu.map(({ icon, name, link }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                href={link}
                target={""}
              >
                {icon}
                {name}
              </MenuItem>
            ))}

            <SizedBox height={24} />

            <Text type="secondary" style={{marginBottom: 10}}>Community</Text>
            {communityMenu.map(({ icon, name, link }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                href={link}
                target={""}
              >
                {icon}
                {name}
              </MenuItem>
            ))}
          </Column>
        </MenuContainer>
        <WalletWrapper>
          <Wallet />
        </WalletWrapper>
      </div>
    </Root>
  );
};
export default observer(MobileMenu);
