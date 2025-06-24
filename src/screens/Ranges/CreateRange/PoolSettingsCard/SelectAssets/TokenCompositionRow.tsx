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
import ShareTokenInput from "./ShareTokenInput";
import BN from "@src/utils/BN";
import AssetSelector from "./AssetSelector";
import RangeSelector from "./RangeSelector";
import MaxSellOffSelector from "./MaxSellOffSelector";

interface IProps {
  balances: Balance[];

  asset: IToken;
  onUpdateAsset: (assetId: string, newAssetId: string) => void;

  minPrice?: BN;
  onUpdateMinPrice?: (price: BN) => void;

  maxPrice?: BN;
  onUpdateMaxPrice?: (price: BN) => void;

  maxSellOff?: BN;
  onUpdateMaxSellOff?: (sellOff: BN) => void;

  share: BN;
  setShare: (e: BN) => void;

  locked: boolean;
  onLockClick: () => void;

  onDelete: () => void;

  baseToken?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;
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

const StyledClose = styled(Close)<{ baseToken?: boolean }>`
  margin-left: 10px;
  width: 16px;
  height: 16px;
  cursor: ${({ baseToken }) => (baseToken ? "auto" : "pointer")};
  opacity: ${({ baseToken }) => (baseToken ? 0.5 : 1)};
`;

const TokenCompositionRow: React.FC<IProps> = ({
  asset,
  onUpdateAsset,
  balances,
  minPrice,
  onUpdateMinPrice,
  maxPrice,
  onUpdateMaxPrice,
  maxSellOff,
  onUpdateMaxSellOff,
  share,
  setShare,
  locked,
  onLockClick,
  onDelete,
  baseToken,
}) => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <Root>
      <AssetSelector
        asset={asset}
        balances={balances}
        onUpdateAsset={onUpdateAsset}
      />
      <Row mainAxisSize="fit-content" alignItems="center">
        {!baseToken && (
          <Row alignItems="center">
            <SizedBox width={24} />
            <RangeSelector
              asset={asset}
              balances={balances}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onUpdateMinPrice={onUpdateMinPrice}
              onUpdateMaxPrice={onUpdateMaxPrice}
            />
            <SizedBox width={24} />
            <MaxSellOffSelector
              value={maxSellOff}
              onUpdate={onUpdateMaxSellOff}
            />
            <SizedBox width={30} />
          </Row>
        )}
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
          baseToken={baseToken}
          onClick={!baseToken ? onDelete : undefined}
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
