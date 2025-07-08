import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import AddLiquidityToRangeAmountSelector from "./AddLiquidityToRangeAmountSelector";
import DepositComposition from "./DepositComposition";
import YourPool from "./YourRange";
import Notification from "@components/Notification";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddLiquidityToCustomPool: React.FC<IProps> = () => {
  return (
    <Root>
      <YourPool />
      <SizedBox height={24} />
      <AddLiquidityToRangeAmountSelector />
      <SizedBox height={24} />
      <DepositComposition />
    </Root>
  );
};
export default AddLiquidityToCustomPool;
