import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import newswap from "@src/assets/icons/new-trade-swap.svg";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useNavigate } from "react-router-dom";
import Loading from "@components/Loading";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import { useTheme } from "@emotion/react";
import { useSwapVM } from "@screens/TradeInterface/SwapVM";
import BN from "@src/utils/BN";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  new?: boolean;
}

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
  price1?: undefined | BN
) => {
  let priceDisplay = price1?.toFormat(4);
  if (priceDisplay === "0.0000") {
    priceDisplay = price1?.toFormat(8);
  }
  const val = price1 != null ? `~ ${priceDisplay}` : "–";
  return `1 ${symbol0} = ${val} ${symbol1}`;
};

const SwitchTokensButton: React.FC<IProps> = ({ ...rest }) => {
  const vm = useSwapVM();
  const theme = useTheme();
  const { token0, token1, price } = vm;
  const navigate = useNavigate();
  const [switched, setSwitched] = useState(false);
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
  const stablesIds = [
    TOKENS_BY_SYMBOL.XTN.assetId,
    TOKENS_BY_SYMBOL.USDT.assetId,
    TOKENS_BY_SYMBOL.USDTu.assetId,
    TOKENS_BY_SYMBOL.USDCu.assetId,
    TOKENS_BY_SYMBOL.ROME.assetId,
  ];

  const rate = stablesIds.some((assetId) => assetId === token0?.assetId)
    ? buildRateStr(
        token1?.symbol,
        token0?.symbol,
        price != null && price.gt(0) ? price.pow(-1) : undefined
      )
    : buildRateStr(
        token0?.symbol,
        token1?.symbol,
        price != null && price.gt(0) ? price : undefined
      );
  return (
    <Root {...rest} onClick={handleSwitch}>
      <img
        alt="swap"
        src={rest.new ? newswap : theme.images.icons.swap}
        className="icon"
        style={{
          transform: switched ? "rotate(360deg)" : "rotate(0)",
          margin: "0 8px",
        }}
      />
      {!rest.new && (
        <>
          <SizedBox width={8} />
          <Text>{!vm.synchronizing ? rate : <Loading />}</Text>
          <SizedBox width={16} />
        </>
      )}
    </Root>
  );
};
export default SwitchTokensButton;
