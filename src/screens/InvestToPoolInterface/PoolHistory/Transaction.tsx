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

interface IProps extends ITransaction {
  tokens: Record<string, IToken>;
}

const Root = styled(Row)``;
const StyledRow = styled(Row)`
  margin: 0 16px;
  @media (min-width: 880px) {
    margin: 0 24px;
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
  const date = new Date(timestamp);
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
      <StyledRow>{draw()}</StyledRow>
      <Text style={{ whiteSpace: "nowrap" }}>
        {/*$ {pool.globalLiquidity.toFormat(2)}*/}
      </Text>
      <Text style={{ whiteSpace: "nowrap" }}>{date.toDateString()}</Text>
    </Root>
  );
};
export default observer(Transaction);
