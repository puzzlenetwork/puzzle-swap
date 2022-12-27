import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useMultiSwapVM } from "@screens/MultiSwapInterface/MultiSwapVM";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";

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

const SwitchTokensButton: React.FC<IProps> = ({ ...rest }) => {
  const [switched, setSwitched] = useState(false);
  const vm = useMultiSwapVM();
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
  const theme = useTheme();
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
      <Text>
        1 {vm.token0?.symbol} = ~ {vm.rate?.toFormat(4) ?? "—"}{" "}
        {vm.token1?.symbol}
      </Text>
      <SizedBox width={16} />
    </Root>
  );
};
export default SwitchTokensButton;
