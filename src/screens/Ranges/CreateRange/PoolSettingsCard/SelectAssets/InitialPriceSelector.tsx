import Button from "@src/components/Button";
import Dialog from "@src/components/Dialog";
import BN from "@src/utils/BN";
import { useState } from "react";
import Text from "@src/components/Text";
import SizedBox from "@src/components/SizedBox";
import { Row, Column } from "@src/components/Flex";
import SquareTokenIcon from "@src/components/SquareTokenIcon";
import { IRangeToken } from "../../CreateRangeVm";
import PriceLimitInput from "./PriceLimitInput";
import Skeleton from "react-loading-skeleton";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";

// Fixed-width slot for price text/Skeleton to avoid table layout shifts while loading
const PriceSlot = styled.span`
  display: inline-block;
  min-width: 110px; /* keep consistent width for both Skeleton and final price */
  text-align: left;
  margin-left: 4px;
`;

interface IParams {
  asset: IRangeToken;
  value: BN;
  onUpdate: (v: BN) => void;
  baseTokenSymbol?: string;
}

const InitialPriceSelector = ({ asset, value, onUpdate, baseTokenSymbol }: IParams) => {
  const [modalOpened, setModalOpened] = useState(false);

  const handleOpenModal = () => {
    setModalOpened(true);
  };

  const formattedInitial = BN.formatUnits(value, asset.asset.decimals).toSmallFormat();

  return (
    <>
      <Button onClick={handleOpenModal} size="small" kind="secondary" fixed>
        Initial Price:
        <PriceSlot>
          {asset.priceLoaded ? (
            `${formattedInitial} ${baseTokenSymbol}`
          ) : (
            <Skeleton width="100%" height={16} inline />
          )}
        </PriceSlot>
      </Button>
      <Dialog
        visible={modalOpened}
        style={{ maxWidth: "360px" }}
        styles={{
          body: {
            padding: "16px 24px"
          }
        }}
        onClose={() => setModalOpened(false)}
        title="Initial Price"
      >
        <Text size="medium">
          Initial Price is the price of the selected token expressed in the base token. It defines the starting point of
          the price curve for that token within the range.
        </Text>
        <SizedBox height={16} />
        <Text type="secondary">Asset</Text>
        <SizedBox height={8} />
        <Row alignItems="center">
          <SquareTokenIcon src={asset.asset.logo} size="small" />
          <SizedBox width={8} />
          <Column crossAxisSize="max">
            <Text size="medium">{asset.asset.name}</Text>
            <Text size="small" type="secondary">
              {asset.asset.symbol}
            </Text>
          </Column>
          {asset.priceLoaded ? (
            asset.currentPrice && asset.currentPrice.gt(0) && (
              <Text size="medium" fitContent nowrap>
                {BN.formatUnits(asset.currentPrice, asset.asset.decimals).toSmallFormat()} {baseTokenSymbol}
              </Text>
            )
          ) : (
            <Skeleton width={80} height={18} />
          )}
        </Row>
        <SizedBox height={16} />
        <Text type="secondary">Change Initial Price</Text>
        <SizedBox height={8} />
        <PriceLimitInput
          amount={value}
          decimals={asset.asset.decimals}
          onChange={(v) => onUpdate(v)}
          placeholder={
            asset.currentPrice
              ? BN.formatUnits(asset.currentPrice, asset.asset.decimals).toSmallFormat()
              : "Enter Initial Price"
          }
        />
        <SizedBox height={24} />
        <Button onClick={() => setModalOpened(false)} size="medium" fixed>
          Confirm
        </Button>
      </Dialog>
    </>
  );
};

export default observer(InitialPriceSelector);
