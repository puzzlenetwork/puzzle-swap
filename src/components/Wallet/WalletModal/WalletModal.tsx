import styled from "@emotion/styled";
import React, { useEffect } from "react";
import RcDialog from "rc-dialog";
import "./wallet.css";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import SizedBox from "@components/SizedBox";
import WalletModalHeader from "./WalletModalHeader";
import WalletModalBody from "@components/Wallet/WalletModal/WalletModalBody";
import { WalletVMProvider } from "@components/Wallet/WalletModal/WalletVM";
import { observer } from "mobx-react-lite";
import { lockBodyScroll, unlockBodyScroll } from "@src/utils/scrollLock";

interface IProps extends IDialogPropTypes {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  overflow-y: auto; /* Allow internal scrolling while page behind stays locked */
  -webkit-overflow-scrolling: touch;
`;

const WalletModal: React.FC<IProps> = ({ ...rest }) => {
  const { visible } = rest as { visible?: boolean };

  // Lock body scroll when modal becomes visible; release on hide/unmount.
  useEffect(() => {
    if (visible) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
    return; // eslint-disable-line consistent-return
  }, [visible]);

  return (
    <RcDialog
      wrapClassName="wallet-dialog"
      closeIcon={<CloseIcon style={{ marginTop: 8 }} />}
      animation="zoom"
      maskAnimation="fade"
      destroyOnClose
      {...rest}
    >
      <WalletVMProvider>
        <Root>
          <SizedBox height={48} />
          <WalletModalHeader />
            <SizedBox height={56} />
          <WalletModalBody />
        </Root>
      </WalletVMProvider>
    </RcDialog>
  );
};
export default observer(WalletModal);
