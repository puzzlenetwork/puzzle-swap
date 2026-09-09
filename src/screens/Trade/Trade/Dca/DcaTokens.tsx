import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import SizedBox from "@components/SizedBox";
import Token from "@screens/Trade/Trade/LimitOrders/Token";
import { useDcaVM } from "@screens/Trade/DcaVM";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React from "react";

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArrowImg = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
  position: absolute;
  right: calc(50% - 16px);
  top: -12px;
  transition: 0.4s;

  :hover {
    transform: rotate(180deg);
  }
`;

const DcaTokens: React.FC = () => {
  const vm = useDcaVM();
  const theme = useTheme();
  const { accountStore, notificationStore } = useStores();

  const warnSameAsset = () =>
    notificationStore.notify("You can't choose same assets", { type: "warning", title: "Warning" });

  return (
    <Root>
      <Token
        badge="You spend"
        assetId={vm.assetId0}
        balances={accountStore.balances}
        balanceError={vm.amountError}
        setAssetId={(assetId) => (assetId === vm.assetId1 ? warnSameAsset() : vm.setAssetId0(assetId))}
      />
      <SizedBox height={8} style={{ position: "relative" }}>
        <ArrowImg onClick={vm.switchTokens} src={theme.images.icons.limitOrderArrow} alt="switch" />
      </SizedBox>
      <Token
        badge="You accumulate"
        assetId={vm.assetId1}
        balances={accountStore.balances}
        setAssetId={(assetId) => (assetId === vm.assetId0 ? warnSameAsset() : vm.setAssetId1(assetId))}
      />
    </Root>
  );
};

export default observer(DcaTokens);
