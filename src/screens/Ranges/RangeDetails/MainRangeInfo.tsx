import styled from "@emotion/styled";
import React from "react";
import bg from "@src/assets/rangesBackground.png";
import link from "@src/assets/icons/whiteLink.svg";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useRangeDetailsInterfaceVM } from "./RangeDetailsVM";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import TransparentDetailsBtn from "./RangeDetailsBtn";
import { useNavigate } from "react-router-dom";
import centerEllipsis from "@src/utils/centerEllipsis";
import TextButton from "@components/TextButton";
import { themes } from "@src/themes/ThemeProvider";

interface IProps {
  isMobile?: boolean;
}

const ShortInfo = styled.div<{ pic: string }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
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
      isCustom ? "1fr 1fr 1fr 3fr" : "1fr 1fr 4fr 1fr"};
    grid-template-rows: 1fr;
    padding-top: 44px;
  }
`;
const Hat = styled.div`
  display: flex;
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

const WSCAN_EXPLORER_URL = "https://wscan.io/";

const MainRangeInfo: React.FC<IProps> = ({ isMobile }) => {
  const vm = useRangeDetailsInterfaceVM();
  const navigate = useNavigate();
  const handleSmartContractClick = () =>
    window.open(`${WSCAN_EXPLORER_URL}${vm.range!.address}`);
  const whiteText = { color: themes.lightTheme.colors.white };
  return (
    <ShortInfo pic={bg}>
      <Column crossAxisSize="max">
        <Hat>
          <Column>
            <Title size="large" weight={500} style={whiteText}>
              Range {vm.range!.title}
            </Title>
            <SizedBox height={4} />
            <Text type="purple300" size="medium">
              Trade fees: {vm.range!.swapFee.toFormat(2)}%
            </Text>
          </Column>
        </Hat>
        <Links isCustom={vm.range!.isCustom}>
          <Column>
            <Text type="purple300" size="medium">
              Smart Contract
            </Text>
            <TextButton prefix={link} onClick={handleSmartContractClick}>
              {centerEllipsis(vm.range?.address ?? "", 8)}
            </TextButton>
          </Column>
          <SizedBox height={16} />
          <Column>
            <Text type="purple300" size="medium" nowrap>
              Range Owner
            </Text>
            <Text type="light" size="medium">
              <TextButton
                prefix={link}
                onClick={() =>
                  window.open(`${WSCAN_EXPLORER_URL}${vm.range?.owner}`)
                }
              >
                {centerEllipsis(vm.range?.owner ?? "", 8)}
              </TextButton>
            </Text>
          </Column>
          <SizedBox height={20} />
          <Row justifyContent="flex-end">
            <Button
              fixed={isMobile}
              size="medium"
              style={{ marginRight: 8 }}
              onClick={() => navigate(`/range/${vm.range!.address}`)}
            >
              Trade
            </Button>
            <TransparentDetailsBtn />
          </Row>
        </Links>
      </Column>
    </ShortInfo>
  );
};
export default observer(MainRangeInfo);
