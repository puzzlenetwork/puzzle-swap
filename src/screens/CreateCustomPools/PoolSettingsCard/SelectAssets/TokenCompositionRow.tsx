import styled from "@emotion/styled";
import React, { useState } from "react";
import { IToken } from "@src/constants";
import Balance from "@src/entities/Balance";
import RoundTokenIcon from "@components/RoundTokenIcon";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import TokenSelectModal from "@components/TokensSelectModal/TokenSelectModal";
import arrowDownIcon from "@src/assets/icons/thingArrowDown.svg";
import { ReactComponent as Lock } from "@src/assets/icons/lock.svg";
import { ReactComponent as Unlock } from "@src/assets/icons/unlock.svg";
import { ReactComponent as Close } from "@src/assets/icons/smallClose.svg";
import { Row } from "@src/components/Flex";
import ShareTokenInput from "@screens/CreateCustomPools/PoolSettingsCard/SelectAssets/ShareTokenInput";
import BN from "@src/utils/BN";

interface IProps {
  balances: Balance[];

  asset: IToken;
  onUpdateAsset: (assetId: string, newAssetId: string) => void;

  share: BN;
  setShare: (e: BN) => void;

  locked: boolean;
  onLockClick: () => void;

  onDelete: () => void;

  disabled?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
const AssetContainer = styled.div<{
  disabled?: boolean;
  modalOpened?: boolean;
}>`
  display: flex;
  flex-direction: row;
  border: 1px solid #f1f2fe;
  border-radius: 10px;
  width: fit-content;
  padding: 8px 32px 8px 8px;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  position: relative;
  :after {
    position: absolute;
    inset: 12px 8px 12px auto;
    content: url(${arrowDownIcon});
    transition: 0.4s;
    transform: rotate(${({ modalOpened }) => (modalOpened ? 0 : -90)}deg);
  }
  :hover {
    :after {
      transform: rotate(${({ disabled }) => (!disabled ? 0 : -90)}deg);
    }
  }
`;

const StyledClose = styled(Close)<{ disabled?: boolean }>`
  margin-left: 10px;
  width: 16px;
  height: 16px;
  cursor: ${({ disabled }) => (disabled ? "auto" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0 : 1)};
`;

const TokenCompositionRow: React.FC<IProps> = ({
  onUpdateAsset,
  asset,
  balances,
  setShare,
  share,
  locked,
  onLockClick,
  onDelete,
  disabled,
}) => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <Root>
      <AssetContainer
        disabled={disabled}
        modalOpened={openModal}
        onClick={() => !disabled && setOpenModal(true)}
      >
        <RoundTokenIcon src={asset.logo} />
        <SizedBox width={8} />
        <Text>{asset.symbol}</Text>
      </AssetContainer>
      <Row mainAxisSize="fit-content" alignItems="center">
        <ShareTokenInput
          amount={share}
          onChange={setShare}
          disabled={locked}
          maxValue={new BN(1001)}
        />
        <SizedBox width={10} />
        {locked ? (
          <Lock onClick={onLockClick} style={{ cursor: "pointer" }} />
        ) : (
          <Unlock onClick={onLockClick} style={{ cursor: "pointer" }} />
        )}
        <StyledClose
          disabled={disabled}
          onClick={!disabled ? onDelete : undefined}
        />
      </Row>
      <TokenSelectModal
        selectedTokenId={asset.assetId}
        visible={openModal}
        onSelect={(newAssetId) => onUpdateAsset(asset.assetId, newAssetId)}
        balances={balances}
        onClose={() => setOpenModal(!openModal)}
      />
    </Root>
  );
};
export default TokenCompositionRow;
