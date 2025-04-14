import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useMultiSwapVM } from "@screens/MultiSwapInterface/MultiSwapVM";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import BN from "@src/utils/BN";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
  margin: 16px 0;

  .icon {
    transition: 0.4s;
  }
`;

const buildRateStr = (
  symbol0: string | undefined,
  symbol1: string | undefined,
  price1?: string | number | undefined
) => `1 ${symbol0} = ${price1 != null ? `~ ${price1}` : "–"} ${symbol1}`;

const SwitchTokensButton: React.FC<IProps> = ({ ...rest }) => {
  const [switched, setSwitched] = useState(false);
  const vm = useMultiSwapVM();
  const theme = useTheme();
  const { token0, token1, amount0, amount1, rate } = vm;
  const navigate = useNavigate();
  const handleSwitch = () => {
    vm.switchTokens();
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("asset0", vm.assetId0);
    urlSearchParams.set("asset1", vm.assetId1);
    navigate({
      pathname: window.location.pathname,
      search: `?${urlSearchParams.toString()}`,
    });
    setSwitched((v) => !v);
  };

  const price = BN.formatUnits(amount1, token1?.decimals).div(
    BN.formatUnits(amount0, token0?.decimals)
  ); // TODO: Needs `.times(1 - commision)` if there is a commission

  const rateStr = buildRateStr(
    token0?.symbol,
    token1?.symbol,
    price != null && price.gt(0)
      ? price?.toFormat(4)
      : rate.gt(0)
      ? rate.toFormat(4)
      : undefined
  );
  return (
    <Root {...rest} onClick={handleSwitch}>
      <img
        alt="swap"
        src={theme.images.icons.swap}
        className="icon"
        style={{
          transform: switched ? "rotate(360deg)" : "rotate(0)",
          margin: "0 8px",
        }}
      />
      <SizedBox width={8} />
      <Text>{rateStr}</Text>
      <SizedBox width={16} />
    </Root>
  );
};
export default SwitchTokensButton;
