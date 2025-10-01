import Card from "@components/Card";
import Divider from "@components/Divider";
import { Row } from "@components/Flex";
import Layout from "@components/Layout";
import Loading from "@components/Loading";
import SizedBox from "@components/SizedBox";
import SwapDetailRow from "@components/SwapDetailRow";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import styled from "@emotion/styled";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import TokenInput from "@src/components/TokenInput";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Details from "./Details";
import SwapButton from "./SwapButton";
import { urlSafeToOriginalDomain } from "@src/utils/rangeUrlUtils";
import SwitchTokensButton from "./SwitchTokensButton";
import TooltipFeeInfo from "./TooltipFeeInfo";
import { TradeInRangeVMProvider, useTradeInRangeVM } from "./TradeInRangeVM";
import { NOTIFICATION_TYPE } from 'react-notifications-component';

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  min-width: 100%;
  min-height: 100%;
  margin-bottom: 24px;
  margin-top: 40px;
  @media (min-width: 880px) {
    margin-top: 56px;
  }
`;

const TradeInRangeInterfaceImpl: React.FC = observer(() => {
  const vm = useTradeInRangeVM();
  const navigate = useNavigate();
  const { notificationStore } = useStores();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const asset0 = params.get("asset0")?.toString();
      const asset1 = params.get("asset1")?.toString();
      if (asset0 != null) {
        vm.setAssetId0(asset0);
      }
      if (asset1 != null) {
        vm.setAssetId1(asset1);
      }
    } catch (e) {}
  });

  const handleSetAssetId0 = (assetId: string) => {
    if (assetId === vm.assetId1) {
      notificationStore.notify("You can't choose same assets", {
        type: "danger",
        title: "Warning"
      });
      return;
    }
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset0", assetId);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`
    });
    vm.setAssetId0(assetId);
  };

  const handleSetAssetId1 = (assetId: string) => {
    if (assetId === vm.assetId0) {
      notificationStore.notify("You can't choose same assets", {
        title: "Warning",
        type: "danger"
      });
      return;
    }
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset1", assetId);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`
    });
    vm.setAssetId1(assetId);
  };

  const minToRecieve = useMemo(() => {
    if (vm.token1 == null || vm.amount1.isNaN()) return null;
    return `~ ${BN.formatUnits(vm.minimumToReceive, vm.token1.decimals).toFormat(2)} ${vm.token1.name}`;
  }, [vm.token1, vm.amount1, vm.minimumToReceive]);

  if (vm.range == null) {
    return <Loading />;
  }
  return (
    <Layout>
      <Root>
        <Card paddingDesktop="32px" maxWidth={560}>
          <TokenInput
            selectable={true}
            decimals={TOKENS_BY_ASSET_ID[vm.token0!.assetId].decimals}
            amount={vm.amount0}
            setAmount={vm.setAmount0}
            assetId={vm.assetId0}
            setAssetId={handleSetAssetId0}
            balances={vm.balances ?? []}
            onMaxClick={vm.amount0MaxClickFunc}
            usdnEquivalent={vm.amount0UsdnEquivalent}
          />
          <SwitchTokensButton />
          <TokenInput
            selectable={true}
            decimals={TOKENS_BY_ASSET_ID[vm.token1!.assetId].decimals}
            amount={new BN(vm.amount1)}
            assetId={vm.assetId1}
            setAssetId={handleSetAssetId1}
            balances={vm.balances ?? []}
            usdnEquivalent={vm.amount1UsdnEquivalent}
          />
          <SizedBox height={24} />
          <SwapButton />
          <SizedBox height={16} />
          <SwapDetailRow title="Price impact">
            <Row alignItems="center" mainAxisSize="fit-content" justifyContent="flex-end">
              {vm.priceImpact && (
                <Text type={vm.priceImpact.gt(5) ? "error" : "primary"}>
                  ~{vm.priceImpact.toFormat(4)}%
                  {vm.priceImpact.gt(5) && " (High price impact)"}
                  &nbsp;
                </Text>
              )}
              {vm.token0 && !vm.amount0.isNaN() && (
                <Tooltip content={<TooltipFeeInfo />} config={{ placement: "top" }}>
                  <InfoIcon />
                </Tooltip>
              )}
            </Row>
          </SwapDetailRow>
          <Divider />
          <SwapDetailRow title="Minimum to receive">
            <Row alignItems="center" mainAxisSize="fit-content" justifyContent="flex-end">
              {vm.priceImpact && <Text nowrap>{minToRecieve}</Text>}
            </Row>
          </SwapDetailRow>
        </Card>
        <SizedBox height={16} />
        <Details />
      </Root>
    </Layout>
  );
});

const TradeInRangeInterface: React.FC = () => {
  const { rangeDomain } = useParams<{ rangeDomain: string }>();
  const decodedRangeDomain = rangeDomain ? urlSafeToOriginalDomain(rangeDomain) : "";
  const { rangesStore } = useStores();
  const range = rangesStore.getRangeByDomain(decodedRangeDomain);
  const rangeAddress = range?.address ?? "";
  
  return (
    <TradeInRangeVMProvider rangeAddress={rangeAddress}>
      <TradeInRangeInterfaceImpl />
    </TradeInRangeVMProvider>
  );
};

export default TradeInRangeInterface;
