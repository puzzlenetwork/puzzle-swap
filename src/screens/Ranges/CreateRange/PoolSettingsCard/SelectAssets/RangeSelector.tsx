import Button from "@src/components/Button";
import Dialog from "@src/components/Dialog";
import { IToken } from "@src/constants";
import BN from "@src/utils/BN";
import { useState } from "react";
import Text from "@src/components/Text";
import SizedBox from "@src/components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import SquareTokenIcon from "@src/components/SquareTokenIcon";
import Balance from "@src/entities/Balance";
import PriceLimitInput from "./PriceLimitInput";
import { useTheme } from "@emotion/react";

interface IParams {
  asset: IToken;
  balances: Balance[];
  minPrice?: BN;
  maxPrice?: BN;
  onUpdateMinPrice?: (newMinPrice: BN) => void;
  onUpdateMaxPrice?: (newMaxPrice: BN) => void;
}

const RangeSelector = ({ asset, balances, minPrice, maxPrice, onUpdateMinPrice, onUpdateMaxPrice }: IParams) => {
  const theme = useTheme();
  const [modalOpened, setModalOpened] = useState(false);

  const balance = balances.find(b => b.assetId === asset.assetId);
  const containsError = minPrice && maxPrice && minPrice.gte(maxPrice);

  return (
    <>
      <Button
        onClick={() => setModalOpened(true)}
        size="medium"
        kind="secondary"
        style={{
          width: "120px",
          borderColor: containsError ? theme.colors.error500 : undefined,
        }}
      >{(minPrice && maxPrice) ? (
        <span style={{ display: "flex", fontSize: "14px" }}>{BN.formatUnits(minPrice, asset.decimals).toBigFormat(1)} <span style={{ fontSize: "1.4rem", transform: "translateY(-0.25rem)", margin: "0 0.2rem" }}>⟷</span> {BN.formatUnits(maxPrice, asset.decimals).toBigFormat(1)}</span>
      ) : "Add"}</Button>
      <Dialog
        visible={modalOpened}
        style={{ maxWidth: 360 }}
        bodyStyle={{ minHeight: 264 }}
        onClose={() => setModalOpened(false)}
        title="Set Range"
      >
        <Text type="secondary" weight={500}>Asset</Text>
        <SizedBox height={8} />
        <Row alignItems="center">
          <SquareTokenIcon src={asset.logo} size="small" />
          <SizedBox width={8} />
          <Column crossAxisSize="max">
            <Text size="medium">{asset.name}</Text>
            <Text size="small" type="secondary">{asset.symbol}</Text>
          </Column>
          <Column alignItems="flex-end">
            <Text size="medium" textAlign="end">{balance?.formatBalance ?? "0.00"}</Text>
            <Text size="small" type="secondary" textAlign="end" nowrap>{balance?.formatUsdnEquivalent ?? "0.00 $"}</Text>
          </Column>
        </Row>
        <SizedBox height={16} />
        <Text type="secondary" weight={500}>Range</Text>
        <SizedBox height={8} />
        <Row alignItems="center">
          <PriceLimitInput
            amount={minPrice ?? BN.ZERO}
            onChange={(newMinPrice) => onUpdateMinPrice && onUpdateMinPrice(newMinPrice)}
            decimals={asset.decimals}
            placeholder="Min"
          />
          <SizedBox width={8} />
          <Text type="secondary" fitContent style={{ fontSize: "1.4rem", transform: "translateY(-0.25rem)" }}>⟷</Text>
          <SizedBox width={8} />
          <PriceLimitInput
            amount={maxPrice ?? BN.ZERO}
            onChange={(newMaxPrice) => onUpdateMaxPrice && onUpdateMaxPrice(newMaxPrice)}
            decimals={asset.decimals}
            placeholder="Max"
          />
        </Row>
        <SizedBox height={24} />
        <Button
          onClick={() => setModalOpened(false)}
          size="medium"
          fixed
        >
          Confirm
        </Button>
      </Dialog>
    </>
  )
}

export default RangeSelector;
