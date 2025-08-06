import arrowDownIcon from "@src/assets/icons/thingArrowDown.svg";
import styled from "@emotion/styled";
import { useState } from "react";
import RoundTokenIcon from "@src/components/RoundTokenIcon";
import SizedBox from "@src/components/SizedBox";
import Text from "@src/components/Text";
import { IToken } from "@src/constants";
import TokenSelectModal from "@src/components/TokensSelectModal";
import Balance from "@src/entities/Balance";

interface IParams {
  asset: IToken;
  onUpdateAsset: (assetId: string, newAssetId: string) => void;
  balances: Balance[];
}

const AssetContainer = styled.div<{ modalOpened?: boolean }>`
  display: flex;
  flex-direction: row;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 10px;
  width: fit-content;
  padding: 8px 32px 8px 8px;
  align-items: center;
  cursor: pointer;
  position: relative;

  :after {
    position: absolute;
    top: 12px;
    right: 8px;
    bottom: 12px;
    content: url(${arrowDownIcon});
    transition: 0.4s;
    transform: rotate(${({ modalOpened }) => (modalOpened ? 0 : -90)}deg);
  }

  :hover {
    :after {
      transform: rotate(-90deg);
    }
  }
`;

const AssetSelector = ({ asset, onUpdateAsset, balances }: IParams) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <AssetContainer modalOpened={openModal} onClick={() => setOpenModal(true)}>
        <RoundTokenIcon src={asset.logo} />
        <SizedBox width={8} />
        <Text nowrap>{asset.symbol}</Text>
      </AssetContainer>

      <TokenSelectModal
        selectedTokenId={asset.assetId}
        visible={openModal}
        onSelect={(newAssetId) => onUpdateAsset(asset.assetId, newAssetId)}
        balances={balances}
        onClose={() => setOpenModal(!openModal)}
      />
    </>
  );
};

export default AssetSelector;
