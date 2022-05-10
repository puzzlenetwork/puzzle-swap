import styled from "@emotion/styled";
import React from "react";
import bg from "@src/assets/puzzleBackground2.png";
import customBg from "@src/assets/customPuzzleBg.png";
import puzzleIcon from "@src/assets/icons/smallWhitePuzzle.svg";
import link from "@src/assets/icons/whiteLink.svg";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import TransparentDetailsBtn from "@screens/InvestToPoolInterface/TransparentDetailsBtn";
import { useNavigate } from "react-router-dom";
import centerEllipsis from "@src/utils/centerEllipsis";
import TextButton from "@components/TextButton";
import { EXPLORER_URL } from "@src/constants";

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
    grid-template-columns: ${({ isCustom }) =>
      isCustom ? "1fr 1fr 1fr 3fr 1fr" : "1fr 1fr 4fr 1fr"};
    grid-template-rows: 1fr;
    padding-top: 44px;
  }
`;
const MainPoolInfo: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const navigate = useNavigate();
  const handleSmartContractClick = () =>
    window.open(`${EXPLORER_URL}/address/${vm.pool.contractAddress}`);
  return (
    <Root>
      <ShortInfo pic={vm.pool.isCustom ? customBg : bg}>
        <Column crossAxisSize="max">
          <Text type="light" size="large" weight={500}>
            {vm.pool.title}
          </Text>
          <SizedBox height={4} />
          <Text type="purple300" size="medium">
            Trade fees: {vm.pool.swapFee}%
          </Text>
          <Links isCustom={vm.pool.isCustom}>
            <Column>
              <Text type="purple300" size="medium" nowrap>
                Creator of the pool
              </Text>
              <Text type="light" size="medium">
                {vm.pool.isCustom ? (
                  <TextButton
                    prefix={link}
                    onClick={() =>
                      window.open(`${EXPLORER_URL}/address/${vm.pool?.owner}`)
                    }
                  >
                    {centerEllipsis(vm.pool?.owner ?? "", 6)}
                  </TextButton>
                ) : (
                  <TextButton prefix={puzzleIcon}>Puzzle Swap</TextButton>
                )}
              </Text>
              <SizedBox height={16} />
            </Column>
            {vm.pool.isCustom && (
              <Column
                onClick={() =>
                  window.open(
                    `${EXPLORER_URL}/tx/${vm.pool?.artefactOriginTransactionId}`
                  )
                }
              >
                <Text type="purple300" size="medium" nowrap>
                  Created via
                </Text>
                <TextButton prefix={link}>{vm.nftPaymentName}</TextButton>
                <SizedBox height={16} />
              </Column>
            )}
            <Column>
              <Text type="purple300" size="medium">
                Smart-contract
              </Text>
              <TextButton prefix={link} onClick={handleSmartContractClick}>
                View on Explorer
              </TextButton>
            </Column>
            <SizedBox height={16} />
            <Row>
              <Button
                fixed
                size="medium"
                style={{ marginRight: 8 }}
                onClick={() => navigate(`/pools/${vm.pool.domain}`)}
              >
                Trade
              </Button>
              <TransparentDetailsBtn />
            </Row>
          </Links>
        </Column>
      </ShortInfo>
    </Root>
  );
};
export default observer(MainPoolInfo);
