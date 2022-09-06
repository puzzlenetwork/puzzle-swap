import styled from "@emotion/styled";
import React from "react";
import { Row } from "@src/components/Flex";
import chart from "@src/assets/icons/chart.svg";
import nochart from "@src/assets/icons/no-chart.svg";
import settings from "@src/assets/icons/settings.svg";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useTradeVM } from "@screens/TradeInterface/TradeVM";
import Tabs from "@components/Tabs";

interface IProps {}

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  //border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
  padding-bottom: 16px;
  margin-bottom: 16px;
  @media (min-width: 880px) {
    margin-bottom: 24px;
  }
`;
const Icon = styled.img`
  cursor: pointer;
`;

const IconsBlock = styled(Row)`
  position: absolute;
  right: 0;
`;
const SettingsHeader: React.FC<IProps> = () => {
  const vm = useTradeVM();
  return (
    <Root>
      <Tabs
        tabs={[{ name: "Swap" }, { name: "Limit" }]}
        activeTab={vm.activeAction}
        setActive={vm.setActiveAction}
      />
      <IconsBlock mainAxisSize="fit-content">
        <Icon
          src={vm.openedChart ? chart : nochart}
          alt="pic"
          onClick={() => vm.setOpenedChart(!vm.openedChart)}
        />
        <SizedBox width={8} />
        <Icon
          src={settings}
          alt="pic"
          onClick={() => vm.setOpenedSettings(!vm.openedSettings)}
        />
      </IconsBlock>
    </Root>
  );
};
export default observer(SettingsHeader);
