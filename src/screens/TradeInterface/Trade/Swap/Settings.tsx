import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import Card from "@components/Card";
import { ReactComponent as Close } from "@src/assets/icons/darkClose.svg";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import Tooltip from "@src/components/Tooltip";
import BN from "@src/utils/BN";
import SizedBox from "@components/SizedBox";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import ShareTokenInput from "@screens/CreateCustomPools/PoolSettingsCard/SelectAssets/ShareTokenInput";
import TextButton from "@components/TextButton";
import Button from "@components/Button";
import { useTheme } from "@emotion/react";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import { useStores } from "@stores";

interface IProps {}

interface ISettingsStorageData {
  slippage: number;
}

const Root = styled(Card)<{ expanded: boolean }>`
  ${({ expanded }) => (!expanded ? "display:none;" : "")}
  position: absolute;
  z-index: 20;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  inset: 0;
`;

const Tag = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: ${({ active, theme }) =>
    active ? theme.colors.white : theme.colors.primary650};
  background: ${({ active, theme }) =>
    active ? theme.colors.blue500 : theme.colors.white};
  border: 1px solid
    ${({ active, theme }) =>
      active ? theme.colors.blue500 : theme.colors.primary100};
  box-sizing: border-box;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 12px;
  height: 40px;
  @media (min-width: 880px) {
    padding: 8px 20px;
  }
`;
const Settings: React.FC<IProps> = () => {
  const vm = useSwapVM();
  const theme = useTheme();
  const storageData = localStorage.getItem("puzzle-user-settings");
  const initData: ISettingsStorageData | null = storageData
    ? JSON.parse(storageData)
    : null;
  const initialSlippage = new BN(initData ? initData.slippage : 1).times(10);
  const [slippage, setSlippage] = useState(initialSlippage);
  const isSomethingChanged = slippage.eq(initialSlippage);
  const handleClose = () => vm.setOpenedSettings(false);
  const validateSlippage = (v: number) =>
    // assuming that slippage is a number in [0,100] as required for percentage
    !isNaN(v) && v > 0 ? Math.min(v, 100) : 1;
  const handleSave = () => {
    localStorage.setItem(
      "puzzle-user-settings",
      JSON.stringify({
        ...initData,
        slippage: validateSlippage(slippage.div(10).toNumber()),
      })
    );
    handleClose();
  };
  const handleReset = () => {
    setSlippage(initialSlippage);
    handleClose();
  };
  return (
    <Root
      expanded={vm.openedSettings}
      paddingDesktop="16px 24px"
      paddingMobile="16px"
      justifyContent="space-between"
    >
      {/*header*/}
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderBottom: `1px solid ${theme.colors.primary100}`,
          paddingBottom: 16,
        }}
      >
        <Text weight={500}>Settings</Text>
        <Close onClick={handleClose} style={{ cursor: "pointer" }} />
      </Row>
      <SizedBox height={24} />
      {/*body*/}
      <Column mainAxisSize="stretch">
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                Maximum acceptable % difference between the expected amount of
                token and the amount you actually receive if the token ratio in
                the pool suddenly change.
              </Text>
            }
          >
            <Row alignItems="center">
              <Text fitContent weight={500}>
                Slippage tolerance
              </Text>
              <InfoIcon style={{ marginLeft: 8 }} />
            </Row>
          </Tooltip>
          <SizedBox height={8} />
          <Row>
            {[1, 3, 5].map((v) => (
              <Tag
                key={v + "percent"}
                onClick={() => setSlippage(new BN(v * 10))}
                active={slippage.eq(new BN(v * 10))}
                style={{ marginRight: 4 }}
              >
                {v} %
              </Tag>
            ))}
            <ShareTokenInput
              amount={slippage}
              onChange={(v) => setSlippage(v)}
              maxValue={new BN(1000)}
              error={slippage.gt(1000)}
            />
          </Row>
        </Column>
        <SizedBox height={24} />
      </Column>
      {/*footer*/}
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderTop: `1px solid ${theme.colors.primary100}`,
          paddingTop: 16,
        }}
      >
        <TextButton kind="secondary" weight={500} onClick={handleReset}>
          Reset
        </TextButton>
        <Button
          size="medium"
          onClick={handleSave}
          disabled={isSomethingChanged || slippage.gt(1000)}
        >
          Save
        </Button>
      </Row>
    </Root>
  );
};
export default observer(Settings);
