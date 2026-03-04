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
import Skeleton from "react-loading-skeleton";
import Tag from "@src/components/Tag";

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
const Links = styled.div`
  width: 100%;
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  @media (min-width: 880px) {
    flex-direction: row;
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
  const handleSmartContractClick = () => vm.range && window.open(`${WSCAN_EXPLORER_URL}${vm.range.address}`);
  const whiteText = { color: themes.lightTheme.colors.white };
  return (
    <ShortInfo pic={bg}>
      <Column crossAxisSize="max">
        <Hat>
          <Column>
            <Row alignItems="center">
              <Title size="large" weight={500} style={{ ...whiteText, width: "fit-content", whiteSpace: "nowrap" }}>
                Range {vm.range?.domain}
              </Title>
              {vm.range?.swapFee.gte(100) && (
                <Tag type="error" style={{ marginLeft: 8 }}>
                  Paused
                </Tag>
              )}
            </Row>
            <SizedBox height={4} />
            <Text type="purple300" size="medium">
              Trade fees: {vm.range ? `${vm.range.swapFee.toFormat(2)}%` : <Skeleton width={36} height={16} />}
            </Text>
          </Column>
        </Hat>
        <Links>
          <Column>
            <Text type="purple300" size="medium">
              Smart Contract
            </Text>
            <TextButton prefix={link} onClick={handleSmartContractClick}>
              {vm.range ? centerEllipsis(vm.range.address ?? "") : <Skeleton width={84} height={16} />}
            </TextButton>
          </Column>
          <SizedBox width={24} height={16} />
          <Column>
            <Text type="purple300" size="medium" nowrap>
              Range Creator
            </Text>
            <TextButton prefix={link} onClick={() => vm.range && window.open(`${WSCAN_EXPLORER_URL}${vm.range.owner}`)}>
              {vm.range ? centerEllipsis(vm.range.owner ?? "") : <Skeleton width={84} height={16} />}
            </TextButton>
          </Column>
          <SizedBox height={20} />
          <Row justifyContent="flex-end">
            <Button
              fixed={isMobile}
              size="medium"
              style={{ marginRight: 8 }}
              onClick={() => vm.range && navigate(`/ranges/${vm.range.address}`)}
              disabled={!vm.range}
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
