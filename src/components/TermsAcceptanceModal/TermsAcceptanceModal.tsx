import styled from "@emotion/styled";
import React, { useState } from "react";
import RcDialog from "rc-dialog";
import "rc-dialog/assets/index.css";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import Checkbox from "@components/Checkbox";
import { Link } from "react-router-dom";
import { ROUTES } from "@src/constants";

interface IProps extends IDialogPropTypes {
  onAccept: () => void;
}

const StyledDialog = styled(RcDialog)`
  .rc-dialog-content {
    background: transparent;
    padding: 0;
  }

  .rc-dialog-body {
    padding: 0;
  }

  @media (min-width: 560px) {
    width: 480px !important;
  }
`;

const Root = styled(Column)`
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
`;

const CheckboxContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: 380px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.primary50};
  border-radius: 12px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.colors.primary100};
  }
`;

const CheckboxLabel = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.primary650};

  a {
    color: ${({ theme }) => theme.colors.blue500};
    text-decoration: underline;
    font-weight: 500;

    &:hover {
      color: ${({ theme }) => theme.colors.blue500};
      opacity: 0.8;
    }
  }
`;

const TermsAcceptanceModal: React.FC<IProps> = ({ onAccept, onClose, ...rest }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      onAccept();
    }
  };

  return (
    <StyledDialog
      closeIcon={<CloseIcon style={{ marginTop: 8 }} />}
      animation="zoom"
      maskAnimation="fade"
      maskClosable={false}
      keyboard={false}
      closable={false}
      onClose={onClose}
      {...rest}
    >
      <Root>
        <Text size="large" weight={500}>
          Terms of Service
        </Text>
        <SizedBox height={16} />
        <Text size="medium" style={{ lineHeight: "24px" }}>
          Before you continue, please read and accept our Terms of Service. By using Puzzle Network, you acknowledge that you understand the risks associated with cryptocurrency trading and DeFi protocols.
        </Text>
        <SizedBox height={24} />
        <CheckboxContainer onClick={() => setIsChecked(!isChecked)}>
          <Checkbox checked={isChecked} onChange={setIsChecked} />
          <CheckboxLabel>
            I have read and agree to the{" "}
            <Link to={ROUTES.TERMS_OF_SERVICE} target="_blank" onClick={(e) => e.stopPropagation()}>
              Terms of Service
            </Link>
          </CheckboxLabel>
        </CheckboxContainer>
        <SizedBox height={24} />
        <Button
          size="large"
          onClick={handleAccept}
          disabled={!isChecked}
          fixed
        >
          Continue
        </Button>
      </Root>
    </StyledDialog>
  );
};

export default TermsAcceptanceModal;
