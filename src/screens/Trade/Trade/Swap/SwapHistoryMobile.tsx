import React from "react";
import { observer } from "mobx-react-lite";
import Dialog from "@components/Dialog";
import SwapHistory from "./SwapHistory";

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const SwapHistoryMobile: React.FC<IProps> = observer(({ visible, onClose }) => {
  return (
    <Dialog
      onClose={onClose}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" }
      }}
      visible={visible}
      title="Swap History"
    >
      <SwapHistory />
    </Dialog>
  );
});

export default SwapHistoryMobile;
