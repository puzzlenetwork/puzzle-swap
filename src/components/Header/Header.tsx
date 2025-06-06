import styled from "@emotion/styled";
import React, {useEffect, useState} from "react";
import MenuIcon from "@src/assets/icons/menu.svg";
import closeIcon from "@src/assets/icons/close.svg";
import { Column, Row } from "@components/Flex";
import MobileMenu from "@components/Header/MobileMenu";
import mobileMenuIcon from "@src/assets/icons/mobileMenu.svg";
import SizedBox from "@components/SizedBox";
import Wallet from "@components/Wallet/Wallet";
import { observer } from "mobx-react-lite";
import { PRODUCTS, ROUTES } from "@src/constants";
import { Link, useLocation } from "react-router-dom";
import { Anchor } from "@components/Anchor";
import { useTheme } from "@emotion/react";
import Tooltip from "@components/Tooltip";
import LinkGroup from "@components/LinkGroup";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import { ReactComponent as MediumIcon } from "@src/assets/links/medium.svg";
import { ReactComponent as XIcon } from "@src/assets/links/x.svg";
import { ReactComponent as TelegramIcon } from "@src/assets/links/telegram.svg";
import { ReactComponent as RobotIcon } from "@src/assets/links/robot.svg";
import { ReactComponent as GithubIcon } from "@src/assets/links/github.svg";
import ProductList from "../ProductList";
import SwapIcon from "@src/assets/links/swap.svg";
import NodeIcon from "@src/assets/links/node.svg";
import LendIcon from "@src/assets/links/lend.svg";
import MarketIcon from "@src/assets/links/market.svg";
import { ReactComponent as Arrow } from "@src/assets/icons/arrowDownTransparent.svg";
import { useStores } from "@src/stores";
import { THEME_TYPE } from "@src/themes/ThemeProvider";
import { ReactComponent as WalletIcon } from "@src/assets/icons/pink-wallet.svg";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  align-items: center;
  z-index: 102;
  box-shadow: 0 8px 56px rgba(54, 56, 112, 0.16);

  //todo check
  a {
    text-decoration: none;
  }
`;

const TopMenu = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  padding: 0 16px;
  padding-right: 24px;
  max-width: 1440px;
  z-index: 102;
  @media (min-width: 880px) {
    height: 80px;
  }
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.white};

  .logo {
    height: 30px;
    @media (min-width: 880px) {
      height: 36px;
    }
  }

  .icon {
    cursor: pointer;
  }
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  border-bottom: 4px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.blue500 : "transparent"};
  height: 100%;
  margin: 0 9px;

  a {
    color: ${({ selected, theme }) =>
      selected ? theme.colors.primary800 : theme.colors.primary650};
  }

  &:hover {
    border-bottom: 4px solid ${({ theme }) => theme.colors.primary300};
    a {
      color: ${({ theme }) => theme.colors.blue500};
    }
  }
`;

const Mobile = styled.div`
  display: flex;
  min-width: fit-content;
  @media (min-width: 880px) {
    display: none;
  }
`;

const Desktop = styled.div`
  gap: 15px;
  display: none;
  min-width: fit-content;
  @media (min-width: 880px) {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const BurgerMenu = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  cursor: pointer;
  background: ${({ expanded, theme }) =>
    expanded ? theme.colors.primary100 : theme.colors.white};

  :hover {
    background: ${({ theme }) => theme.colors.primary100};
  }
`;

const RowLinks = styled(Row)`
  margin-top: 15px;
  align-items: center;
  justify-content: center;
  gap: 30px;
  cursor: pointer;
  :hover {
    cursor: pointer;
  }
`;

const Header: React.FC<IProps> = () => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const [bannerClosed /*, setBannerClosed*/] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const { accountStore } = useStores();
  const location = useLocation();
  const theme = useTheme();
  const toggleMenu = (state: boolean) => {
    setMobileMenuOpened(state);
  };
  const isDarkTheme = accountStore.selectedTheme === THEME_TYPE.DARK_THEME;

  useEffect(() => {
    if (mobileMenuOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpened]);

  const menuItems = [
    { name: "Explore", link: ROUTES.EXPLORE },
    { name: "Trade", link: ROUTES.TRADE },
    { name: "Pools", link: ROUTES.POOLS },
    { name: "Stake", link: ROUTES.STAKE },
  ];

  const products = [
    {
      name: "Puzzle Swap",
      link: PRODUCTS.SWAP,
      icon: SwapIcon,
      isActive: true,
    },
    { name: "Puzzle Lend", link: PRODUCTS.LEND, icon: LendIcon },
    { name: "Puzzle Market", link: PRODUCTS.MARKET, icon: MarketIcon },
    { name: "Puzzle Node", link: PRODUCTS.NODE, icon: NodeIcon },
  ];

  const communityLinks = [
    {
      icon: <TelegramIcon className={isDarkTheme ? "theme_icon" : ""} />,
      link: "https://t.me/puzzle_network",
      isExternalLink: true,
    },
    {
      icon: <XIcon className={isDarkTheme ? "theme_icon" : ""} />,
      link: "https://twitter.com/puzzle_network",
      isExternalLink: true,
    },
    {
      icon: <MediumIcon />,
      link: "https://medium.com/@puzzlenetwork",
      isExternalLink: true,
    },
    {
      icon: <GithubIcon />,
      link: "https://github.com/puzzlenetwork",
      isExternalLink: true,
    },
  ];

  const communityMenu = [
    {
      icon: <RobotIcon className={isDarkTheme ? "theme_icon" : ""} />,
      name: "Notifications bot",
      link: "https://t.me/puzzle_swap",
      isExternalLink: true,
    },
    {
      icon: <RobotIcon className={isDarkTheme ? "theme_icon" : ""} />,
      name: "Alerts bot",
      link: "https://t.me/puzzle_alerts_bot",
      isExternalLink: true,
    },
  ];
  return (
    <Root>
      <Mobile>
        <MobileMenu
          opened={mobileMenuOpened}
          onClose={() => toggleMenu(false)}
          {...{ bannerClosed }}
        />
      </Mobile>
      {/*<Banner closed={bannerClosed} setClosed={setBannerClosed} />*/}

      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          <Tooltip
            config={{
              placement: "bottom-start",
              trigger: "click",
              onVisibleChange: setIsTooltipOpen,
            }}
            content={
              <Column crossAxisSize="max">
                <ProductList title="" links={products} />
                <SizedBox
                  height={1}
                  style={{ width: "100%", background: "#F1F2FE" }}
                />
                <RowLinks>
                  {communityLinks.map((el) => (
                    <a
                      key={el.link}
                      href={el.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {el.icon}
                    </a>
                  ))}
                </RowLinks>
              </Column>
            }
          >
            <Row alignItems="center">
              <img className="logo" src={theme.images.icons.logo} alt="logo" />
              <Arrow
                style={{
                  cursor: "pointer",
                  transform: isTooltipOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s ease",
                }}
              />
            </Row>
          </Tooltip>
          <Desktop>
            <SizedBox width={2} />
            {menuItems.map(({ name, link }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
              >
                <Link to={link} target={link[0] === "/" ? "_self" : "_blank"}>
                  <Row style={{ gap: 8 }}>{name}</Row>
                </Link>
              </MenuItem>
            ))}
          </Desktop>
        </Row>
        <Mobile>
          {accountStore.address != null && !mobileMenuOpened && (
            <WalletIcon
              onClick={() => accountStore.setWalletModalOpened(true)}
              style={{ cursor: "pointer" }}
            />
          )}
          <SizedBox width={16} />
          <img
            onClick={() => toggleMenu(!mobileMenuOpened)}
            className="icon"
            src={mobileMenuOpened ? closeIcon : mobileMenuIcon}
            alt="menuControl"
          />
        </Mobile>
        <Desktop>
          <Wallet />
          <Tooltip
            config={{
              placement: "bottom-start",
              trigger: "click",
            }}
            content={
              <Column crossAxisSize="max">
                <LinkGroup title="" links={communityMenu} />
                <SizedBox height={8} />
              </Column>
            }
          >
            <BurgerMenu expanded={false}>
              <img
                onClick={() => toggleMenu(!mobileMenuOpened)}
                className="icon"
                src={MenuIcon}
                alt="menuControl"
              />
            </BurgerMenu>
          </Tooltip>
        </Desktop>
      </TopMenu>
    </Root>
  );
};
export default observer(Header);
