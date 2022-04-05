import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import AddCustomPoolLiquidityAmount from "./AddCustomPoolLiquidityAmount";
import DepositComposition from "./DepositComposition";
import YourPool from "./YourPool";

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
      <AddCustomPoolLiquidityAmount />
      <SizedBox height={24} />
      <DepositComposition />
    </Root>
  );
};
export default AddLiquidityToCustomPool;
