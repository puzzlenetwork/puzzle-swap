import styled from "@emotion/styled";
import React from "react";
import remove from "@src/assets/icons/removeTransaction.svg";
import Img from "@src/components/Img";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";
import SizedBox from "@src/components/SizedBox";

interface IProps {
  tokens?: IToken & { value: BN }[];
  totalValue?: BN;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
`;

const Remove: React.FC<IProps> = () => {
  return (
    <Root>
      <Img src={remove} alt="remove" />
      <SizedBox width={12} />
    </Root>
  );
};
export default Remove;
