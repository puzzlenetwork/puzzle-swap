import Button from "@src/components/Button";
import Dialog from "@src/components/Dialog";
import BN from "@src/utils/BN";
import { useState } from "react";
import Text from "@src/components/Text";
import SizedBox from "@src/components/SizedBox";
import Slider from "@components/Slider";

interface IParams {
  value?: BN;
  onUpdate?: (v: BN) => void;
}

const MaxSellOffSelector = ({ value, onUpdate }: IParams) => {
  const [modalOpened, setModalOpened] = useState(false);

  const handleOpenModal = () => {
    setModalOpened(true);
    !value && onUpdate && onUpdate(new BN(100)); // Default value if not set
  };

  const maxValue = 500; // Maximum value for the slider

  return (
    <>
      <Button onClick={handleOpenModal} size="small" kind="secondary" fixed>
        {value && value.lt(maxValue) ? `Max Sell-Off: ${value.toNumber()}%` : "Add Max Sell-Off (Optional)"}
      </Button>
      <Dialog
        visible={modalOpened}
        style={{ maxWidth: "360px" }}
        styles={{
          body: { minHeight: "232px" }
        }}
        onClose={() => setModalOpened(false)}
        title="Add Max Sell-Off (Optional)"
      >
        <Text size="medium">
          Sell-Off limits how much % of the pool can be sold in 100 minutes. Protects liquidity providers.
        </Text>
        <SizedBox height={24} />
        <Text type="primary" size="large" style={{ textAlign: "center" }}>
          {(value ?? new BN(100)).toNumber()}%
        </Text>
        <SizedBox height={16} />
        <Slider
          min={0}
          max={maxValue}
          step={1}
          value={(value ?? new BN(100)).toNumber()}
          onChange={(v: number | number[]) => {
            onUpdate && onUpdate(new BN(v.toString()));
          }}
        />
        <SizedBox height={24} />
        <Button onClick={() => setModalOpened(false)} size="medium" fixed>
          Confirm
        </Button>
      </Dialog>
    </>
  );
};

export default MaxSellOffSelector;
