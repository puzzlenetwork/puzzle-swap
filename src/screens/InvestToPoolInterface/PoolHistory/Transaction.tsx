import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";
import { ITransaction } from "@src/utils/types";
import { IToken } from "@src/constants";
import Swap from "./Swap";
import BN from "@src/utils/BN";
import Remove from "./Remove";
import Claim from "./Claim";
import Add from "./Add";
import { useStores } from "@stores";
import dayjs from "dayjs";

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
  id,
  payment,
}) => {
  const { accountStore } = useStores();
  // const date = new Date(timestamp);
  const getDate = () => {
    const date1 = dayjs(timestamp);
    const diff = Math.abs(date1.diff(dayjs(), "minute"));

    if (diff === 0) {
      return "just now";
    }
    if (diff > 0 && diff < 60) {
      return `${diff} min ago`;
    }
    if (diff >= 60 && diff < 600) {
      const v = Math.floor(diff / 60);
      return `about ${v} hours ago`;
    }
  };
  const draw = () => {
    switch (call.function) {
      case "swap":
        const token0 = tokens[payment[0].assetId ?? "WAVES"];
        const amount0 = new BN(payment[0].amount);
        const token1 = tokens[stateChanges.transfers[0].asset ?? ""];
        const am1 =
          call.args[1].type === "list"
            ? stateChanges.transfers[0].amount
            : call.args[1].value;
        const amount1 = new BN(am1);
        return (
          <Swap
            token0={token0}
            amount0={amount0}
            token1={token1}
            amount1={amount1}
          />
        );
      case "generateIndexAndStake":
        return <Add />;
      case "unstakeAndRedeemIndex":
        const total = new BN(call.args[0].value);
        // const unstakedTokens = stateChanges.invokes[0].stateChanges.data.map(
        //   () => {}
        // );
        return <Remove totalValue={total} />;
      case "claimIndexRewards":
        return <Claim />;
    }
  };
  return (
    <Root
      className="gridRow"
      onClick={() => window.open(`${accountStore.EXPLORER_LINK}/tx/${id}`)}
    >
      <Row>{draw()}</Row>
      <Text fitContent nowrap>
        $ 83,344.55
      </Text>
      {/*<Text style={{ whiteSpace: "nowrap" }}>{date.toDateString()}</Text>*/}
      <Text fitContent nowrap>
        {getDate()}
      </Text>
    </Root>
  );
};
export default observer(Transaction);
