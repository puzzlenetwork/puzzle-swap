import styled from "@emotion/styled";
import React from "react";
import claim from "@src/assets/icons/claimTransaction.svg";
import Img from "@src/components/Img";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: row;
`;

const Add: React.FC<IProps> = () => {
  return (
    <Root>
      <Img src={claim} alt="claim" />
    </Root>
  );
};
export default Add;
