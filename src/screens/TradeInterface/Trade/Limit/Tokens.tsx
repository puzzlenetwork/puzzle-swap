import styled from "@emotion/styled";
import React from "react";
import { useLimitVM } from "@screens/TradeInterface/Trade/Limit/LimitVM";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Img from "@components/Img";
import { useTheme } from "@emotion/react";
import Token from "./Token";
import { useNavigate } from "react-router-dom";
import { useTradeVM } from "@screens/TradeInterface/TradeVM";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const Tokens: React.FC<IProps> = () => {
  const vm = useLimitVM();
  const tradeVm = useTradeVM();
  const theme = useTheme();
  const navigate = useNavigate();
  const handleSetAssetId0 = (assetId: string) => {
    if (assetId === vm.assetId1) return;
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset0", assetId);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`,
    });
    vm.setAssetId0(assetId);
    tradeVm.setAssetId0(assetId);
  };
  return (
    <Root>
      <Token
        assetId={vm.assetId0}
        balances={vm.balances}
        setAssetId={handleSetAssetId0}
      />
      <SizedBox height={8} style={{ position: "relative" }}>
        <Img
          width="32px"
          height="32px"
          src={theme.images.icons.limitOrderArrow}
          alt="arrow"
          style={{
            position: "absolute",
            right: " calc(50% - 16px)",
            top: "-12px",
          }}
        />
      </SizedBox>
      <Token
        assetId={vm.assetId1}
        balances={vm.balances}
        setAssetId={handleSetAssetId0}
      />
    </Root>
  );
};
export default observer(Tokens);
