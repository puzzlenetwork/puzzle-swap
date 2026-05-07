import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import useCollapse from "@components/Collapse";
import SwapHistory from "./SwapHistory";

interface IProps {
  visible: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  padding: 0 16px 0 8px;
`;

const SwapHistoryDesktop: React.FC<IProps> = observer(({ visible }) => {
  const { getCollapseProps } = useCollapse({
    isExpanded: visible,
    showDuration: 500,
    hideDuration: 0
  });
  return (
    <Root {...getCollapseProps()}>
      <SwapHistory />
    </Root>
  );
});

export default SwapHistoryDesktop;
