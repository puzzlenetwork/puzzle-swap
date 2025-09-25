import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import SquareTokenIcon from "@components/SquareTokenIcon";
import Text from "@components/Text";
import TextButton from "@components/TextButton";
import styled from "@emotion/styled";
import { usePoolInvestVM } from "./PoolInvestVM";
import TransparentDetailsBtn from "./TransparentDetailsBtn";
import customBg from "@src/assets/customPuzzleBg.png";
import puzzleIcon from "@src/assets/icons/smallWhitePuzzle.svg";
import link from "@src/assets/icons/whiteLink.svg";
import bg from "@src/assets/puzzleBackground2.png";
import { Column, Row } from "@src/components/Flex";
import { EXPLORER_URL, ROUTES } from "@src/constants";
import useWindowSize from "@src/hooks/useWindowSize";
import { themes } from "@src/themes/ThemeProvider";
import centerEllipsis from "@src/utils/centerEllipsis";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate } from "react-router-dom";

interface IProps {}

const Root = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;
const ShortInfo = styled.div<{ pic: string }>`
  display: flex;
  flex-direction: column;
  ${({ pic }) => pic && `background: url(${pic});`};
  background-position: center;
  border-radius: 16px;
  padding: 16px;
  @media (min-width: 560px) {
    padding: 24px;
  }
  row-gap: 16px;
`;
const Links = styled.div<{ isCustom?: boolean }>`
  width: 100%;
  padding-top: 32px;
  display: grid;
  column-gap: 8px;
  @media (min-width: 880px) {
    grid-template-columns: ${({ isCustom }) => (isCustom ? "1fr 1fr 1fr 3fr" : "1fr 1fr 4fr 1fr")};
    grid-template-rows: 1fr;
    padding-top: 44px;
  }
`;
const Hat = styled.div`
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  justify-content: space-between;
  @media (min-width: 880px) {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
`;
const Title = styled(Text)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 500;
  @media (min-width: 880px) {
    font-size: 32px;
    line-height: 40px;
  }
`;

const AdaptiveButton = styled(Button)`
  width: fit-content;
  @media (max-width: 880px) {
    width: 100%;
  }
`;
const MainPoolInfo: React.FC<IProps> = () => {
  const vm = usePoolInvestVM();
  const { accountStore } = useStores();
  const navigate = useNavigate();
  const handleSmartContractClick = () => window.open(`${EXPLORER_URL}/${vm.pool.address}`);
  const completePoolInitialization = () => {
    vm.prepareCompletePoolInitialization();
    navigate(ROUTES.POOLS_CREATE);
  };
  const { width } = useWindowSize();
  const whiteText = { color: themes.lightTheme.colors.white };
  return (
    <Root>
      <ShortInfo pic={vm.pool.isCustom ? customBg : bg}>
        <Column crossAxisSize="max">
          <Hat>
            <SquareTokenIcon
              size={width != null && width < 880 ? "small" : "default"}
              src={vm.pool.logo}
              alt="pool-pic"
            />
            <SizedBox width={12} />
            <Column>
              <Title size="large" weight={500} style={whiteText}>
                {vm.pool.title}
              </Title>
              <SizedBox height={4} />
              <Text type="purple300" size="medium">
                Trade fees: {vm.pool.swapFee}%
              </Text>
            </Column>
          </Hat>
          <Links isCustom={vm.pool.isCustom}>
            {/*{vm.pool.isCustom && (*/}
            {/*  <Column*/}
            {/*    onClick={() =>*/}
            {/*      window.open(*/}
            {/*        `${EXPLORER_URL}/transactions/${vm.pool?.artefactOriginTransactionId}`*/}
            {/*      )*/}
            {/*    }*/}
            {/*  >*/}
            {/*    <Text type="purple300" size="medium" nowrap>*/}
            {/*      Created via*/}
            {/*    </Text>*/}
            {/*    <TextButton prefix={link}>{vm.nftPaymentName}</TextButton>*/}
            {/*    <SizedBox height={16} />*/}
            {/*  </Column>*/}
            {/*)}*/}
            <Column>
              <Text type="purple300" size="medium">
                Smart Contract
              </Text>
              <TextButton prefix={link} onClick={handleSmartContractClick}>
                {centerEllipsis(vm.pool?.address ?? "", 8)}
              </TextButton>
            </Column>
            <Column>
              <Text type="purple300" size="medium" nowrap>
                Pool Owner
              </Text>
              <Text type="light" size="medium">
                {vm.pool.isCustom ? (
                  <TextButton prefix={link} onClick={() => window.open(`${EXPLORER_URL}/${vm.pool?.owner}`)}>
                    {centerEllipsis(vm.pool?.owner ?? "", 8)}
                  </TextButton>
                ) : (
                  <TextButton prefix={puzzleIcon}>Puzzle Swap</TextButton>
                )}
              </Text>
              <SizedBox height={16} />
            </Column>
            <SizedBox height={16} />
            <Row justifyContent="flex-end">
              {vm.pool.statistics == null ? (
                <AdaptiveButton fixed size="medium" style={{ marginRight: 8 }} onClick={completePoolInitialization}>
                  Complete pool initialization
                </AdaptiveButton>
              ) : (
                <AdaptiveButton
                  fixed
                  size="medium"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/pools/${vm.pool.domain}`)}
                >
                  Trade
                </AdaptiveButton>
              )}
              {accountStore.address === vm.pool.owner && (
                <AdaptiveButton
                  fixed
                  size="medium"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/pools/${vm.pool.domain}/boost`)}
                >
                  Boost APY
                </AdaptiveButton>
              )}
              <TransparentDetailsBtn />
            </Row>
          </Links>
        </Column>
      </ShortInfo>
    </Root>
  );
};
export default observer(MainPoolInfo);
