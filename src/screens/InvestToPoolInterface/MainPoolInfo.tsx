import styled from "@emotion/styled";
import React from "react";
import bg from "@src/assets/puzzleBackground2.png";
import puzzleIcon from "@src/assets/icons/smallWhitePuzzle.svg";
import link from "@src/assets/icons/whiteLink.svg";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import TransparentDetailsBtn from "@screens/InvestToPoolInterface/TransparentDetailsBtn";
import NakedBtn from "@src/components/NakedBtn";
import { useStores } from "@stores";
import Tooltip from "@src/components/Tooltip";
import MorePoolInformation from "./MorePoolInformation";

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
const Links = styled.div`
  width: 100%;
  padding-top: 32px;
  display: grid;
  column-gap: 8px;
  @media (min-width: 880px) {
    grid-template-columns: 1fr 1fr 4fr 1fr;
    grid-template-rows: 1fr;
    padding-top: 44px;
  }
`;
//todo add diff picture for custom pools
const MainPoolInfo: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const vm = useInvestToPoolInterfaceVM();
  const handleSmartContractClick = () =>
    window.open(
      `${accountStore.EXPLORER_LINK}/address/${vm.pool.contractAddress}`
    );
  const isCustom = false;
  return (
    <Root>
      <ShortInfo pic={bg}>
        <Column crossAxisSize="max">
          <Text type="light" size="large" weight={500}>
            {vm.pool.name}
          </Text>
          <SizedBox height={4} />
          <Text type="purple300" size="medium">
            Trade fees: 2.0%
          </Text>
          <Links>
            <Column>
              <Text type="purple300" size="medium">
                Creater of the pool
              </Text>
              <Text type="light" size="medium">
                {isCustom ? (
                  ""
                ) : (
                  <NakedBtn prefix={puzzleIcon}>Puzzle Swap</NakedBtn>
                )}
              </Text>
              <SizedBox height={16} />
            </Column>
            <Column>
              <Text type="purple300" size="medium">
                Smart-contract
              </Text>
              <NakedBtn prefix={link} onClick={handleSmartContractClick}>
                View on Explorer
              </NakedBtn>
            </Column>
            <SizedBox height={16} />
            <Row>
              <Button fixed size="medium" style={{ marginRight: 8 }}>
                Trade
              </Button>
              <Tooltip
                config={{ placement: "bottom-end", trigger: "click" }}
                content={<MorePoolInformation />}
              >
                <TransparentDetailsBtn />
              </Tooltip>
            </Row>
          </Links>
        </Column>
      </ShortInfo>
    </Root>
  );
};
export default observer(MainPoolInfo);
