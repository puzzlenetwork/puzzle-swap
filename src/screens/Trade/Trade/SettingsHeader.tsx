import styled from "@emotion/styled";
import React from "react";
import { Row } from "@src/components/Flex";
import chart from "@src/assets/icons/chart.svg";
import nochart from "@src/assets/icons/no-chart.svg";
import history from "@src/assets/icons/history.svg";
import nohistory from "@src/assets/icons/no-history.svg";
import settings from "@src/assets/icons/settings.svg";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import Tabs from "@components/Tabs";
import { TRADE_ACTIONS, useSwapVM } from "@screens/Trade/SwapVM";
import { TGatedFeature } from "@src/constants/featureAccess";
import { useFeatureAccess } from "@src/hooks/useFeatureAccess";
import { useNavigate } from "react-router-dom";

interface IProps {
  withSetting?: boolean;
}

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  padding-bottom: 16px;
  margin-bottom: 16px;
  @media (min-width: 880px) {
    margin-bottom: 24px;
  }
`;
const Icon = styled.img`
  cursor: pointer;
`;

const IconsBlock = styled(Row)`
  position: absolute;
  right: 0;
`;
const SettingsHeader: React.FC<IProps> = ({ withSetting }) => {
  const vm = useSwapVM();
  const navigate = useNavigate();
  // one entry per gated feature that can appear as a trade tab
  const featureAccess: Record<TGatedFeature, boolean> = { dca: useFeatureAccess("dca") };

  const visibleActions = TRADE_ACTIONS.map((action, index) => ({ ...action, index })).filter(
    ({ feature }) => feature == null || featureAccess[feature]
  );
  const activeTab = Math.max(
    0,
    visibleActions.findIndex(({ index }) => index === vm.activeAction)
  );

  return (
    <Root>
      <Tabs
        tabs={visibleActions.map(({ name }) => ({ name }))}
        activeTab={activeTab}
        setActive={(n) => {
          const action = visibleActions[n] ?? visibleActions[0];
          const urlSearchParams = new URLSearchParams(window.location.search);
          urlSearchParams.set("asset0", vm.assetId0);
          urlSearchParams.set("asset01", vm.assetId1);
          navigate({
            pathname: action.route,
            search: `?${urlSearchParams.toString()}`
          });
          vm.setActiveAction(action.index);
        }}
      />
      <IconsBlock mainAxisSize="fit-content">
        {withSetting != null && (
          <Icon src={settings} alt="pic" onClick={() => vm.setOpenedSettings(!vm.openedSettings)} />
        )}
        <SizedBox width={8} />
        <Icon
          src={!vm.openedHistory ? history : nohistory}
          alt="Swap history"
          title="Swap history"
          onClick={() => vm.setOpenedHistory(!vm.openedHistory)}
        />
        <SizedBox width={8} />
        <Icon src={!vm.openedChart ? chart : nochart} alt="pic" onClick={() => vm.setOpenedChart(!vm.openedChart)} />
      </IconsBlock>
    </Root>
  );
};
export default observer(SettingsHeader);
