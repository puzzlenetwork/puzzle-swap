import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import { ITransaction } from "@src/utils/types";
import { IToken } from "@src/constants";
import Swap from "./Swap";
import BN from "@src/utils/BN";
import dayjs from "dayjs";
import PoolAction from "./PoolAction";

interface IProps extends ITransaction {
  tokens: Record<string, IToken>;
}

const Root = styled(Row)`
  box-sizing: border-box;
  padding: 16px !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  @media (min-width: 880px) {
    padding: 16px 24px !important;
  }
`;
const Transaction: React.FC<IProps> = ({
  timestamp,
  tokens,
  call,
  stateChanges,
  payment,
}) => {
  if (
    ![
      "swap",
      "swapWithReferral",
      "generateIndexAndStake",
      "generateIndexWithOneTokenAndStake",
      "unstakeAndRedeemIndex",
      "claimIndexRewards",
    ].some((v) => v == call.function)
  ) {
    return null;
  }
  let amount = BN.ZERO;
  const getTime = () => {
    const date1 = dayjs(timestamp);
    const diff = Math.abs(date1.diff(dayjs(), "minute"));
    if (diff === 0) {
      return "just now";
    }
    if (diff > 0 && diff < 60) {
      return `${diff} min ago`;
    }
    if (diff >= 60 && diff < 60 * 24) {
      const v = Math.floor(diff / 60);
      return `about ${v} hours ago`;
    }
    if (diff >= 1500 && diff < 60 * 24 * 7) {
      const v = Math.floor(diff / (60 * 60));
      return `about ${v} days ago`;
    }
  };

  const draw = () => {
    switch (call?.function) {
      case "swap":
      case "swapWithReferral":
        const token0 = tokens[payment[0].assetId ?? "WAVES"];
        const amount0 = new BN(payment[0].amount);
        const token1 = tokens[stateChanges.transfers[0]?.asset ?? ""];
        const am1 =
          call.args[1].type === "list"
            ? stateChanges.transfers[0].amount
            : call.args[1].value;
        const amount1 = new BN(am1);
        amount = BN.formatUnits(am1, token1?.decimals);
        return (
          <Swap
            token0={token0}
            amount0={amount0}
            token1={token1}
            amount1={amount1}
          />
        );
      case "generateIndexAndStake":
        const addedTokens = payment.map(({ assetId, amount }) => ({
          amount: new BN(amount),
          ...tokens[assetId ?? "WAVES"],
        }));
        // const totalAddedUsdn = addedTokens.reduce(
        //   (acc, { assetId, amount }) =>
        //     acc.plus((poolsStore.usdnRate(assetId) ?? BN.ZERO).times(amount)),
        //   BN.ZERO
        // );
        // amount = BN.formatUnits(totalAddedUsdn, 6);
        return <PoolAction tokens={addedTokens} action="add" />;
      case "generateIndexWithOneTokenAndStake":
        const oneToken = stateChanges.invokes[1].payment.map(
          ({ assetId, amount }) => ({
            amount: new BN(amount),
            ...tokens[assetId ?? "WAVES"],
          })
        );
        // const totalAddedOneTokenUsdn = oneToken.reduce(
        //   (acc, { assetId, amount }) =>
        //     acc.plus((poolsStore.usdnRate(assetId) ?? BN.ZERO).times(amount)),
        //   BN.ZERO
        // );
        // amount = BN.formatUnits(totalAddedOneTokenUsdn, 6);
        return <PoolAction tokens={oneToken} action="add" />;
      case "unstakeAndRedeemIndex":
        const removedTokens =
          stateChanges.invokes[1].stateChanges.transfers.map(
            ({ asset, amount }) => ({
              amount: new BN(amount),
              ...tokens[asset ?? "WAVES"],
            })
          );
        // const totalRemovedTokenUsdn = removedTokens.reduce(
        //   (acc, { assetId, amount, decimals }) => {
        //     const tokenAmount = BN.formatUnits(amount, decimals);
        //     const usdnAmount = (poolsStore.usdnRate(assetId) ?? BN.ZERO).times(
        //       tokenAmount
        //     );
        //     console.log(usdnAmount.toString());
        //     return acc.plus(usdnAmount);
        //   },
        //   BN.ZERO
        // );
        // console.log(totalRemovedTokenUsdn.toString());
        // amount = BN.formatUnits(totalRemovedTokenUsdn);
        return <PoolAction tokens={removedTokens} action="remove" />;
      case "claimIndexRewards":
        const claimedTokens = stateChanges.transfers.map(
          ({ asset, amount }) => ({
            amount: new BN(amount),
            ...tokens[asset ?? "WAVES"],
          })
        );
        // const totalClaimedUsdn = claimedTokens.reduce(
        //   (acc, { assetId, amount }) =>
        //     acc.plus((poolsStore.usdnRate(assetId) ?? BN.ZERO).times(amount)),
        //   BN.ZERO
        // );
        // amount = BN.formatUnits(totalClaimedUsdn);
        return <PoolAction tokens={claimedTokens} action="claim" />;
      default:
        return null;
    }
  };
  return (
    <Root className="gridRow" alignItems="center">
      <Row alignItems="center">{draw()}</Row>
      <Text fitContent nowrap>
        {amount.toFormat(2)}
      </Text>
      <Text fitContent nowrap>
        {getTime()}
      </Text>
    </Root>
  );
};
export default observer(Transaction);
