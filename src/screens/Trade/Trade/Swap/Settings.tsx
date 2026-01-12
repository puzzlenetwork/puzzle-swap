import Button from "@components/Button";
import Card from "@components/Card";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import TextButton from "@components/TextButton";
import Switch from "@components/Switch";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ShareTokenInput from "@screens/Pools/CreatePool/PoolSettingsCard/SelectAssets/ShareTokenInput";
import { useSwapVM } from "@screens/Trade/SwapVM";
import { ReactComponent as Close } from "@src/assets/icons/darkClose.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { Column, Row } from "@src/components/Flex";
import Tooltip from "@src/components/Tooltip";
import BN from "@src/utils/BN";
import { getUserSettings, saveUserSettings, IUserSettings } from "@src/utils/userSettings";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useStores } from "@stores";

interface IProps {}

const Root = styled(Card)<{ expanded: boolean }>`
  ${({ expanded }) => (!expanded ? "display:none;" : "")}
  position: absolute;
  z-index: 20;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  inset: 0;
  overflow-y: auto;
`;

const Tag = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.primary650)};
  background: ${({ active, theme }) => (active ? theme.colors.blue500 : theme.colors.white)};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.blue500 : theme.colors.primary100)};
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
  const { accountStore, notificationStore } = useStores();
  const isConnected = !!accountStore.address;
  const initData = getUserSettings();
  const initialSlippage = new BN(initData?.slippage ?? 1).times(10);
  const initialDryRun = initData?.dryRunEnabled ?? false;
  const initialShowRates = initData?.showRatesEnabled ?? false;

  const [slippage, setSlippage] = useState(initialSlippage);
  const [dryRunEnabled, setDryRunEnabled] = useState(initialDryRun);
  const [showRatesEnabled, setShowRatesEnabled] = useState(initialShowRates);

  const hasChanges = !slippage.eq(initialSlippage) || dryRunEnabled !== initialDryRun || showRatesEnabled !== initialShowRates;
  const canSave = hasChanges && !slippage.gt(1000);

  const handleClose = () => vm.setOpenedSettings(false);

  const validateSlippage = (v: number) =>
    !isNaN(v) && v > 0 ? Math.min(v, 100) : 1;

  const handleSave = () => {
    const settings: IUserSettings = {
      ...initData,
      slippage: validateSlippage(slippage.div(10).toNumber()),
      dryRunEnabled,
      showRatesEnabled
    };
    saveUserSettings(settings);
    handleClose();
  };

  const handleReset = () => {
    setSlippage(initialSlippage);
    setDryRunEnabled(initialDryRun);
    setShowRatesEnabled(initialShowRates);
    handleClose();
  };

  return (
    <Root expanded={vm.openedSettings} paddingDesktop="16px 24px" paddingMobile="16px" justifyContent="space-between">
      {/*header*/}
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderBottom: `1px solid ${theme.colors.primary100}`,
          paddingBottom: 16
        }}
      >
        <Text weight={500}>Swap Settings</Text>
        <Close onClick={handleClose} style={{ cursor: "pointer" }} />
      </Row>
      <SizedBox height={12} />
      {/*body*/}
      <Column mainAxisSize="stretch">
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                Maximum acceptable % difference between the expected amount of token and the amount you actually receive
                if the token ratio in the pool suddenly change.
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
        <SizedBox height={16} />
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                {isConnected
                  ? "Simulate swap before execution to get the exact output amount."
                  : "Connect wallet to use this feature."}
              </Text>
            }
          >
            <Row alignItems="center" justifyContent="space-between" style={{ gap: 8}}>
              <Row alignItems="center" style={{ gap: 8}}>
                <Text fitContent weight={500}>
                  Exact number to receive
                </Text>
                <InfoIcon />
              </Row>
              <Switch value={dryRunEnabled} disabled={!isConnected} onChange={() => setDryRunEnabled(!dryRunEnabled)} />
            </Row>
          </Tooltip>
        </Column>
        <SizedBox height={16} />
        <Column crossAxisSize="max">
          <Tooltip
            config={{ placement: "bottom-end", trigger: "click" }}
            content={
              <Text>
                Show exchange rates (e.g. 1 WAVES = 21.75 PUZZLE) next to the swap button.
              </Text>
            }
          >
            <Row alignItems="center" justifyContent="space-between" style={{ gap: 8}}>
              <Row alignItems="center" style={{ gap: 8}}>
                <Text fitContent weight={500}>
                  Show rates
                </Text>
                <InfoIcon />
              </Row>
              <Switch value={showRatesEnabled} onChange={() => setShowRatesEnabled(!showRatesEnabled)} />
            </Row>
          </Tooltip>
        </Column>
      </Column>
      <SizedBox height={24} />
      {/*footer*/}
      <Row
        alignItems="center"
        justifyContent="space-between"
        style={{
          borderTop: `1px solid ${theme.colors.primary100}`,
          paddingTop: 16
        }}
      >
        <TextButton kind="secondary" weight={500} onClick={handleReset}>
          Reset
        </TextButton>
        <Button size="medium" onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </Row>
    </Root>
  );
};
export default observer(Settings);
