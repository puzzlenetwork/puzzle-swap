import Card from "@components/Card";
import Input from "@components/Input";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import styled from "@emotion/styled";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { Row } from "@src/components/Flex";
import Notification from "@src/components/Notification";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useCreateRangeVM } from "../../CreateRangeVm";
import ShareTokenInput from "../../PoolSettingsCard/SelectAssets/ShareTokenInput";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Tag = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 20px;
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.primary800)};
  background: ${({ active, theme }) => (active ? theme.colors.blue500 : theme.colors.white)};
  border: 1px solid ${({ active, theme }) => (active ? theme.colors.blue500 : theme.colors.primary100)};
  box-sizing: border-box;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
`;
const TitleAndDomainPoolSetting: React.FC<IProps> = () => {
  const vm = useCreateRangeVM();
  const swapFeeError = vm.swapFee.gt(50) || vm.swapFee.lt(1);
  const [customPercent, setCustomPercent] = useState<BN>(vm.swapFee ?? new BN(10));
  const handleChangeCustomPercent = (v: BN) => {
    setCustomPercent(v);
    vm.setSwapFee(v);
  };

  return (
    <Root>
      <Text type="secondary" weight={500}>
        Range Settings
      </Text>
      <SizedBox height={8} />
      <Card>
        <Text type="secondary" size="medium">
          Title of the range
        </Text>
        <SizedBox height={4} />
        <Input value={vm.domain} onChange={(e) => vm.setDomain(e.target.value)} placeholder="Enter the title…" />
        <SizedBox height={16} />
        <Row mainAxisSize="fit-content" alignItems="center">
          <Text type="secondary" size="medium">
            Swap fees&nbsp;
          </Text>
          <Tooltip
            containerStyles={{ display: "flex", alignItems: "center" }}
            content={
              <Text size="small" style={{ whiteSpace: "pre-line" }}>
                {`While LPs in your range will earn a half of the swap fee, it also determines how competitive the range is — lower fees may attract more trades and increase potential earnings.`}
              </Text>
            }
          >
            <InfoIcon style={{ width: 14, height: 14 }} />
          </Tooltip>
        </Row>
        <SizedBox height={8} />
        <Row>
          {[0.3, 1, 3].map((value, index) => (
            <Tag
              key={value + "percent"}
              onClick={() => vm.setSwapFee(new BN(value * 10))}
              active={vm.swapFee.eq(new BN(value * 10))}
              style={{ marginRight: 4 }}
            >
              {value} %
            </Tag>
          ))}
          <ShareTokenInput
            onClick={() => handleChangeCustomPercent(customPercent)}
            amount={customPercent}
            error={swapFeeError}
            onChange={handleChangeCustomPercent}
          />
        </Row>
        <SizedBox height={16} />
        <Notification
          style={{ marginLeft: 8 }}
          type="info"
          text="Fee affects how much traders will pay when interacting with your Range. A higher fee can earn you more from volatile markets, but may reduce trading volume."
        />
        {swapFeeError && (
          <Notification style={{ marginTop: 16 }} type="error" text="Swap fees for the range must be from 0.1% to 5%" />
        )}
      </Card>
    </Root>
  );
};
export default observer(TitleAndDomainPoolSetting);
