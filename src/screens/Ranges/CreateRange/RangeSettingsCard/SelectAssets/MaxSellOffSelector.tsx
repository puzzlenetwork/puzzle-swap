import Button from "@src/components/Button";
import Dialog from "@src/components/Dialog";
import BN from "@src/utils/BN";
import { useEffect, useState } from "react";
import Text from "@src/components/Text";
import SizedBox from "@src/components/SizedBox";
import Slider from "@components/Slider";

interface IParams {
  value?: BN;
  onUpdate?: (v: BN | undefined) => void;
}

const MaxSellOffSelector = ({ value, onUpdate }: IParams) => {
  const maxValue = 500; // Maximum value for the slider

  const [modalOpened, setModalOpened] = useState(false);
  const [sliderValue, setSliderValue] = useState(value ?? new BN(100));

  // change slider value when prop changes
  useEffect(() => {
    setSliderValue(value ?? new BN(100));
  }, [value]);

  const handleOpenModal = () => {
    setModalOpened(true);
    !value && onUpdate && onUpdate(new BN(100)); // Default value if not set
  };

  const handleChangeSlider = (value: number | number[]) => {
    setSliderValue(new BN(value.toString()));
  };

  const handleSubmit = () => {
    onUpdate && onUpdate(sliderValue);
    setModalOpened(false);
  };

  const handleRemove = () => {
    onUpdate && onUpdate(undefined);
    setSliderValue(new BN(100));
    setModalOpened(false);
  };

  return (
    <>
      <Button onClick={handleOpenModal} size="small" kind="secondary" fixed>
        {value && value.lt(maxValue) ? `Max Sell-Off: ${value.toNumber()}%` : "Add Max Sell-Off (Optional)"}
      </Button>
      <Dialog
        visible={modalOpened}
        style={{ maxWidth: "360px" }}
        styles={{
          body: { paddingBottom: "16px" }
        }}
        onClose={() => setModalOpened(false)}
        title="Add Max Sell-Off (Optional)"
      >
        <Text size="medium">
          Sell-Off limits how much % of the pool can be sold in 100 minutes. Protects liquidity providers.
        </Text>
        <SizedBox height={24} />
        <Text type="primary" size="large" style={{ textAlign: "center" }}>
          {sliderValue.toNumber()}%
        </Text>
        <SizedBox height={16} />
        <Slider
          min={0}
          max={maxValue}
          step={1}
          value={sliderValue.toNumber()}
          onChange={(v: number | number[]) => {
            handleChangeSlider(v);
          }}
        />
        <SizedBox height={24} />
        <Button onClick={handleSubmit} size="medium" fixed>
          Confirm
        </Button>
        <SizedBox height={8} />
        <Button onClick={handleRemove} size="medium" fixed kind="secondary">
          Remove
        </Button>
      </Dialog>
    </>
  );
};

export default MaxSellOffSelector;
