import React, { useMemo } from "react";
import Notification from "@components/Notification";
import { Link } from "react-router-dom";
import buildBuyTokenRoute from "@src/utils/buildBuyTokenRoute";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import Text from "@components/Text";
import { feeToProvideLiquidity, useCreateRangeVM } from "../../CreateRangeVm";

interface IProps {}

const LowBalanceNotifications: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();
  const minBalanceAsset = vm.minBalanceAsset;
  const minBalance = useMemo(() => minBalanceAsset.inWallet ?? new BN(0), [minBalanceAsset]);

  const reachedLimit = useMemo(() => {
    return vm.providedPercentOfPool.eq(100) && !minBalance.eq(0);
  }, [vm.providedPercentOfPool, minBalance]);

  const limitWithZeroBalance = useMemo(() => {
    return vm.minBalanceAsset
      && minBalance.eq(0)
      && (vm.zeroAssetBalances != null && vm.zeroAssetBalances < 2);
  }, [minBalance, vm.minBalanceAsset, vm.zeroAssetBalances]);

  return (
    <>
      {reachedLimit && (
        <Notification
          type="info"
          text={`You’ve reached the limit with ${minBalanceAsset?.asset.symbol}.${minBalanceAsset?.asset.assetId === "WAVES" ? ` Note that you need ${BN.formatUnits(feeToProvideLiquidity, 8).toString()} WAVES for transaction fee.` : ""}`}
          style={{ margin: 24 }}
        />
      )}
      {limitWithZeroBalance ? (
          <Notification
            type="warning"
            text={
              <Text size="medium">
                You’ve reached the limit with {vm.minBalanceAsset.asset.symbol}
                .&nbsp;
                <Link to={buildBuyTokenRoute(`trade`, vm.minBalanceAsset.asset.assetId)}>
                  Buy {vm.minBalanceAsset.asset.symbol}
                </Link>
                &nbsp;to create this range.
              </Text>
            }
            style={{ margin: 24 }}
          />
        ) : (
          <Notification
            type="warning"
            text={
              <Text size="medium">
                You must have all assets to bring liquidity to the range. Please top up empty balances
              </Text>
            }
            style={{ margin: 24 }}
          />
        )}
    </>
  );
};
export default observer(LowBalanceNotifications);
